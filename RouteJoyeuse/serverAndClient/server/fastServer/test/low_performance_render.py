import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import glfw
import cv2
import json

# 加载本地的 imagenet_class_index.json 文件
with open('imagenet_class_index.json') as f:
    class_index = json.load(f)

# 创建类ID到索引的映射
id_to_class = {v[0]: v[1] for k, v in class_index.items()}

# 初始化 MobileNetV2 模型
model = MobileNetV2(weights='imagenet')

# 自定义着色器代码
vertex_shader_source = """
#version 330 core
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 color;
out vec3 fragColor;
void main() {
    fragColor = color;
    gl_Position = vec4(position, 1.0);
}
"""

fragment_shader_source = """
#version 330 core
in vec3 fragColor;
out vec4 outColor;
void main() {
    outColor = vec4(fragColor, 1.0);
}
"""

def compile_shader(source, shader_type):
    shader = glCreateShader(shader_type)
    glShaderSource(shader, source)
    glCompileShader(shader)
    if glGetShaderiv(shader, GL_COMPILE_STATUS) != GL_TRUE:
        raise RuntimeError(glGetShaderInfoLog(shader).decode('utf-8'))
    return shader

def create_shader_program():
    vertex_shader = compile_shader(vertex_shader_source, GL_VERTEX_SHADER)
    fragment_shader = compile_shader(fragment_shader_source, GL_FRAGMENT_SHADER)
    program = glCreateProgram()
    glAttachShader(program, vertex_shader)
    glAttachShader(program, fragment_shader)
    glLinkProgram(program)
    if glGetProgramiv(program, GL_LINK_STATUS) != GL_TRUE:
        raise RuntimeError(glGetProgramInfoLog(program).decode('utf-8'))
    glDeleteShader(vertex_shader)
    glDeleteShader(fragment_shader)
    return program

def offscreen_rendering():
    if not glfw.init():
        return None

    # 创建一个隐藏的窗口用于离屏渲染
    glfw.window_hint(glfw.VISIBLE, glfw.FALSE)
    window = glfw.create_window(640, 480, "", None, None)
    if not window:
        glfw.terminate()
        return None
    
    glfw.make_context_current(window)
    
    program = create_shader_program()
    glUseProgram(program)

    # 定义顶点数据
    vertices = np.array([
        -0.5, -0.5, 0.0,  1.0, 0.0, 0.0,
         0.5, -0.5, 0.0,  0.0, 1.0, 0.0,
         0.0,  0.5, 0.0,  0.0, 0.0, 1.0,
    ], dtype=np.float32)

    # 创建 VAO 和 VBO
    VAO = glGenVertexArrays(1)
    VBO = glGenBuffers(1)

    glBindVertexArray(VAO)

    glBindBuffer(GL_ARRAY_BUFFER, VBO)
    glBufferData(GL_ARRAY_BUFFER, vertices.nbytes, vertices, GL_STATIC_DRAW)

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * vertices.itemsize, ctypes.c_void_p(0))
    glEnableVertexAttribArray(0)
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * vertices.itemsize, ctypes.c_void_p(3 * vertices.itemsize))
    glEnableVertexAttribArray(1)

    # 离屏渲染
    framebuffer = glGenFramebuffers(1)
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer)

    texture = glGenTextures(1)
    glBindTexture(GL_TEXTURE_2D, texture)
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 640, 480, 0, GL_RGB, GL_UNSIGNED_BYTE, None)
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0)

    if glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE:
        raise RuntimeError("Framebuffer is not complete")

    glViewport(0, 0, 640, 480)
    glClearColor(0.0, 0.0, 0.0, 1.0)
    glClear(GL_COLOR_BUFFER_BIT)
    
    glBindVertexArray(VAO)
    glDrawArrays(GL_TRIANGLES, 0, 3)

    glBindFramebuffer(GL_FRAMEBUFFER, 0)

    # 从帧缓冲区中读取像素数据
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer)
    pixels = glReadPixels(0, 0, 640, 480, GL_RGB, GL_UNSIGNED_BYTE)
    glBindFramebuffer(GL_FRAMEBUFFER, 0)

    # 清理
    glDeleteVertexArrays(1, [VAO])
    glDeleteBuffers(1, [VBO])
    glDeleteFramebuffers(1, [framebuffer])
    glDeleteTextures(1, [texture])

    glfw.terminate()

    return pixels

def extract_features(image):
    image_resized = cv2.resize(image, (224, 224))
    image_preprocessed = preprocess_input(image_resized)
    image_batch = np.expand_dims(image_preprocessed, axis=0)
    features = model.predict(image_batch)
    return features

def save_rendered_image(image_data, filename):
    image = np.frombuffer(image_data, dtype=np.uint8).reshape(480, 640, 3)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    cv2.imwrite(filename, image)

def main():
    rendered_image = offscreen_rendering()

    if rendered_image is None:
        print("Failed to render the scene.")
        return

    save_rendered_image(rendered_image, 'rendered_image.png')

    # 将渲染结果转换为正确的形状
    rendered_image = np.frombuffer(rendered_image, dtype=np.uint8).reshape(480, 640, 3)
    features = extract_features(rendered_image)
    
    # 解码预测结果
    decoded_predictions = decode_predictions(features, top=3)[0]

    # 显示预测结果
    for i, pred in enumerate(decoded_predictions):
        class_id = pred[0]
        class_name = id_to_class.get(class_id, "Unknown")
        print(f"Prediction {i+1}: {class_name} ({pred[2]*100:.2f}%)")

if __name__ == '__main__':
    main()
