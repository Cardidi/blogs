---
title: 简明扼要的理解RectTransform和Rect
tags:
  - C#
  - Rect
  - Unity
draft: true
createTime: '2025-01-30 02:23:23'
permalink: /article/tech/jian-ming-e-yao-de-li-jie-recttransform-he-rect/
---
我是一个喜欢看文档来学习新事物的人，但是有时候文档也挺难看的。比如Unity官方关于Rect的介绍文档：[https://docs.unity3d.com/ScriptReference/Rect.html](https://docs.unity3d.com/ScriptReference/Rect.html) 讲了半天连最基本的我都没搞懂。所以我打算根据我长期对Rect和RectTransfrom的使用进行整理，完成一份说明文档，也方便未来的我回忆他们。

## 简单说Rect，就是以左下角为坐标原点构建一个正方形盒子

## Rect是一个已经具有具体位置信息的状态，而RectTransfrom则是这个状态的实际持有人
