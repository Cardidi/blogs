---
title: 如何让Unity生成对象时，不调用MonoBehaviour的Awake,OnEnable和Start函数？
tags:
  - C#
  - Unity
  - 对象生命周期
createTime: '2023-10-23 23:09:15'
permalink: /article/tech/generate-gameobject-without-lifecircle-function-called/
---
我们在使用生成游戏对象的函数Object.Instantiate(...)方法时，总是容易遇到一个情况是当我们生成该对象的同时，这个挂载于该对象的MonoBehaviour会在生成的同时调用Awake，OnEnable和Start这三个方法。这经常会带来一个问题，如果我们需要针对这些对象单独配置参数，譬如需要配置初始条件或者对该对象进行调整。

但是很明显，Unity从任何一个方面看都没打算给开发者提供这种功能，因此我们需要一些歪门邪路来实现它——比如我在Zenject的源代码中，学习到了一种利用GameObejct.activeSelf的操作方法。具体研究见下，如果不想看研究，那请看结论部分！

## 对象调用顺序是？

我写了一段测试脚本，用来研究创建对象时，GameObject.activeSelf的true/false对于组件事件的影响。

第一份脚本是一个事件汇报器：

```csharp
// Reporter.cs
using System;
using UnityEngine;

public class Reporter : MonoBehaviour
{
    private void Awake()
    {
        Debug.Log($"    Awake '{name}' at frame {Time.frameCount}");
    }

    private void OnEnable()
    {
        Debug.Log($"    Enable '{name}' at frame {Time.frameCount}");
    }

    private void Start()
    {
        Debug.Log($"    Start '{name}' at frame {Time.frameCount}");
    }
}
```

第二份脚本是一个事件执行器，也就是具体的测试脚本：

```csharp
// Test.cs
using System;
using System.Collections;
using UnityEngine;
using Object = System.Object;

public class Test : MonoBehaviour
{
    [SerializeField]
    private GameObject prefab;

    private void Start()
    {
        StartCoroutine(T());
    }

    private IEnumerator T()
    {
        yield return new WaitForSeconds(1);
        Debug.Log("[[Start Create Object (Enabled)]]");
        CreateObject(true);

        yield return null;
        Debug.Log("[[Start Create Object (Disable)]]");
        CreateObject(false);

        yield return null;
        Debug.Log("[[Start Create Prefab (Enabled)]]");
        CreatePrefab(true);

        yield return null;
        Debug.Log("[[Start Create Prefab (Disable)]]");
        CreatePrefab(false);
    }

    private void CreateObject(bool active)
    {
        var go = new GameObject();
        go.SetActive(active);
        go.AddComponent<Reporter>();
        Debug.Log($"[[CREATED: {active}]]");
        go.SetActive(true);
    }

    private void CreatePrefab(bool active)
    {
        prefab.SetActive(active);
        var go = Instantiate(prefab);
        Debug.Log($"[[CREATED: {active}]]");
        go.SetActive(true);
    }
}
```

第二个脚本有两个特点是

- 每一次对象的创建[都被限制在了同一个阶段发生，但是这个时机晚于Update，先于LateUpdate](https://docs.unity3d.com/Manual/ExecutionOrder.html)。
- 不仅仅测试了通过Object.Instantiate方法，还测试了通过new GameObject然后AddComponent的方法。

所以我们直接来看结果：

```csharp
[[Start Create Object (Enabled)]]
    Awake 'New Game Object' at frame 321
    Enable 'New Game Object' at frame 321
[[CREATED: True]]
    Start 'New Game Object' at frame 321
[[Start Create Object (Disable)]]
[[CREATED: False]]
    Awake 'New Game Object' at frame 322
    Enable 'New Game Object' at frame 322
    Start 'New Game Object' at frame 322
[[Start Create Prefab (Enabled)]]
    Awake 'TestObj(Clone)' at frame 323
    Enable 'TestObj(Clone)' at frame 323
[[CREATED: True]]
    Start 'TestObj(Clone)' at frame 323
[[Start Create Prefab (Disable)]]
[[CREATED: False]]
    Awake 'TestObj(Clone)' at frame 324
    Enable 'TestObj(Clone)' at frame 324
    Start 'TestObj(Clone)' at frame 324
```

可以明显观察到，如果在Instantiate或者AddComponent时，只要被原始对象（Instantiate）或者目标对象(new GameObejct)状态为未激活，那么一定可以阻止Awake, OnEnable和Start方法被调用。那么我们就可以在这个时候趁机进行一些配置工作，比如Zenject框架就借助这个时刻对游戏对象进行依赖注入操作。

但同时，我们也可以发现一个特点是，Start方法不一定会在我们将游戏对象的active状态第一次变成true的时候被调用，具体时机还需要更加深刻的测试才行（但我并不打算这样子做，因为这个行为本质上已经超出了Unity文档所规定的行为，我需要更加深入的信息才能准确得到解答）。

## 结论

我们用几条规律的写法来描述我们的结论：

- 在通过 Object.Instantiate 方法创建游戏对象时，或者通过 AddComponent 方法添加游戏组件时，如果目标对象的 active 状态为 false ，那么这个组件的Awake, OnEnable 和 Start 方法都将不会被调用。
- 新创建的对象状态第一次变为激活状态时（比如创建时，或者被设置为active时）会调用 Awake 和 OnEnable 方法。
- Awake 和 OnEnable 方法，会在 active 第一次变为激活时被一起调用，而且 Start 方法的调用时机不一定和状态变化的时刻被调用。
