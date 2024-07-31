from keras_unet_collection import models

# 加载预训练的U-Net模型
model = models.unet_2d((128, 128, 3), [64, 128, 256, 512, 1024], n_labels=1, 
                       stack_num_down=2, stack_num_up=2, activation='ReLU', 
                       output_activation='Sigmoid', batch_norm=True, pool=True, 
                       unpool=True, backbone='ResNet50', weights='imagenet')

# 保存预训练的权重到本地
model_path = 'unet_resnet50.weights.h5'
model.save_weights(model_path)
