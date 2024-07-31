from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import spacy
import cv2
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
from typing import List, Tuple
from keras_unet_collection import models

app = FastAPI()

# 加载 Spacy 的法语模型
nlp = spacy.load("fr_core_news_sm")

class SRTItem(BaseModel):
    wordsArray: List[List[str]]

@app.post("/process_srt", response_model=List[List[str]])
async def process_srt(srt_item: SRTItem):
    original_words_array = srt_item.wordsArray
    restored_words_array = []
    for words in original_words_array:
        restored_words = []
        for word in words:
            doc = nlp(word)
            for token in doc:
                restored_words.append(token.lemma_)
        restored_words_array.append(restored_words)
    return restored_words_array



class ColorBlock(BaseModel):
    color: Tuple[int, int, int]
    vertices: List[Tuple[int, int]]
    relative_position: Tuple[int, int]
    is_hole: bool

class ImageAnalysisResult(BaseModel):
    blocks: List[ColorBlock]

def detect_edges_custom(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, edges = cv2.threshold(gray_image, 1, 255, cv2.THRESH_BINARY)
    return edges

def detect_color_blocks(image):
    try:
        edges = detect_edges_custom(image)
        cv2.imwrite("custom_edges.png", edges)

        kernel = np.ones((5, 5), np.uint8)
        edges = cv2.erode(edges, kernel, iterations=1)
        edges = cv2.dilate(edges, kernel, iterations=1)

        contours, hierarchy = cv2.findContours(edges, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        
        height, width, _ = image.shape
        blocks = []
        hierarchy = hierarchy[0]

        for i, contour in enumerate(contours):
            if cv2.contourArea(contour) < 100:  # 忽略面积小于100的轮廓
                continue

            epsilon = 0.01 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            vertices = [(int(point[0][0]), height - int(point[0][1])) for point in approx]
            
            color_mask = np.zeros(image.shape[:2], dtype="uint8")
            cv2.drawContours(color_mask, [contour], -1, 255, -1)

            mean_color = cv2.mean(image, mask=color_mask)[:3]
            mean_color_rgb = (int(mean_color[2]), int(mean_color[1]), int(mean_color[0]))

            is_hole = hierarchy[i][3] != -1  # 如果当前轮廓有父轮廓，则它是一个孔洞

            # 处理透明色块
            if mean_color_rgb == (0, 0, 0) and not is_hole:
                continue

            blocks.append({
                'color': mean_color_rgb,
                'vertices': vertices,
                'relative_position': (0, 0),
                'is_hole': is_hole
            })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding contours: {str(e)}")

    return blocks

def calculate_relative_positions(blocks):
    if not blocks:
        return []
    
    first_block_center = np.mean(blocks[0]['vertices'], axis=0)
    
    for block in blocks:
        block_center = np.mean(block['vertices'], axis=0)
        relative_position = (block_center[0] - first_block_center[0], block_center[1] - first_block_center[1])
        block['relative_position'] = (int(relative_position[0]), int(relative_position[1]))
    
    return blocks

@app.post("/process_image", response_model=ImageAnalysisResult)
async def process_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        if image.shape[2] == 4:
            alpha_channel = image[:, :, 3]
            _, mask = cv2.threshold(alpha_channel, 0, 255, cv2.THRESH_BINARY)
            image = cv2.bitwise_and(image, image, mask=mask)
            image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
        
        blocks = detect_color_blocks(image)
        blocks = calculate_relative_positions(blocks)

        output_image = image.copy()
        for block in blocks:
            vertices = np.array(block['vertices'], np.int32)
            vertices = vertices.reshape((-1, 1, 2))
            cv2.polylines(output_image, [vertices], isClosed=True, color=block['color'], thickness=2)
        
        cv2.imwrite("output_image.png", output_image)
        
        return {"blocks": blocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))