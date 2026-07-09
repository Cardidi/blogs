---
title: 使用UniTask执行动画时，Unity报错Missing Reference Exception的解决方法
tags:
  - MissionReferenceException
  - Unity
  - 小知识点
createTime: '2023-05-09 18:01:27'
permalink: >-
  /article/tech/using-unitask-execute-animation-makemissingreferenceexception-solution/
---
我在使用UniTask写动画控制的时候，发现在场景切换的时候总是会报错：

```csharp
MissingReferenceException the object of type 'UILayerBehaviour' has been destroyed
```

我一看出现问题的地方在16行，就觉得很奇怪：

```csharp
private async UniTask LayerCloseNonExpose(bool requireDisable)
{
    try
    { LayerClose(requireDisable); }
#if UNITY_EDITOR
    catch (Exception e)
    { Debug.LogError(e); }
#endif
    finally {}

    if (requireDisable)
    {
        if (m_layerHideAnimation != null)
            await AnimationPlayer(obj.m_layerHideAnimation);

        if (gameObject != null) // Null check for destroyed object.
            gameObject.SetActive(false);
    }
}
```

出错的地方似乎是指16行的`gameObject`访问失败，但是我正是在这里进行测试null值，就是为了规避对象被销毁，但是我访问`gameObject`这个行为就触发了问题。由于这个调用发生在await之后，那么我们在await之前所捕获到的`gameObject`值得实际上是`this.gameObject`。所以实际上问题是this被销毁了（this是一个MonoBehaviour）。

解决这个问题的最简单办法是将16行的`gameObject`变成this，对this进行判断；更加安全的做法是将这个函数修改为static函数，然后让原本的函数去代理执行新的static函数（这样子可以更好的规避一些没有注意到的this访问）：

```csharp
private static async UniTask LayerCloseNonExpose(UILayerBehaviour obj, bool requireDisable)
{
    try
    { obj.LayerClose(requireDisable); }
#if UNITY_EDITOR
    catch (Exception e)
    { Debug.LogError(e); }
#endif
    finally {}

    if (requireDisable)
    {
        if (obj.m_layerHideAnimation != null)
            await obj.AnimationPlayer(obj.m_layerHideAnimation);

        if (obj != null) // Null check for destroyed object.
            obj.gameObject.SetActive(false);
    }
}

// Original method
private void LayerCloseNonExpose(bool requireDisable)
{
    // Avoid MissingReferenceException.
    LayerCloseNonExpose(this, requireDisable);
}
```
