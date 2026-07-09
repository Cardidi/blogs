---
title: 让Unity直接运行Python代码的探究
tags:
  - C#
  - Python
  - Unity
createTime: '2023-04-14 13:58:34'
permalink: /article/tech/run-python-in-unity/
---
在我们彗星工作室的RT001项目中，我们已经构建了一套基于xNode开发的可视化剧情编辑器。这一套编辑器经过检验可以很好的胜任通常的剧情流程设计与控制。但是作为可视化的开发工具，其必然存在的缺陷是不能处理大量流程，同时大量流程会非常难以通过可视化方便的编写，因此我们还需要给策划提供一种便于使用而且可以与当前代码集成的一种方案。

摆在我面前的主要有三个大方向：

- 自己做一个简易的语言：太麻烦了，不仅仅要准备运行时，还需要准备各种集成方案，很麻烦。
- Lua：现成方案不少，但是感觉性能一般，还要添加额外学习成本。
- Python：非常成熟的开发语言，但是在Unity中跑的方案不多。

因为我想尝试挑战一下Python，所以我便开始了Python集成到Unity的工作。

顺带一提，我在Github上找到由[exodrifter](https://github.com/exodrifter/unity-python)维护的一个UnityPython项目，做了非常方便的Unity插件集成。我在他的基础上将Python版本升级到3.4，并且修复了一点问题，具体请见[Cardidi/unity-python](https://github.com/Cardidi/unity-python)。（你如果要用的话，就直接用这个包吧，可以通过UPM导入）

## 集成方式

集成方式主要两大方向：外挂通讯或者内置运行时。先说一下我在网上查到的办法吧：

首先是Unity官方提供了一个[Python For Unity](https://docs.unity3d.com/Packages/com.unity.scripting.python@2.0/manual/index.html)插件用于简化在编辑器下调用Python的插件。注意这里是编辑器而不是运行时，Pass。

然后Google上用Unity+Python去搜索到的结果，大多是如何调用外置的Python运行时，而不是如何将Python集成到Unity内部，Pass。

上面两个都是外挂通讯的方法，这个无法满足我的要求，因此我开始搜索用C#实现的Python运行环境——[IronPython](https://github.com/IronLanguages/ironpython3)，其提供的API可以直接使用C#对Python代码进行编译与执行，同时允许使用dynamic关键词的方式直接调用Python函数。

## IronPython的集成之路

首先第一步是导入IronPython库。我首先简单粗暴的从Github上面下载了最新的可执行二进制包，拿到之后分为netcoreapp3.1、net462和net6.0，分别对应.NET CORE 3.1，.NET Framework 4.6.2和.NET 6.0三种不同的API版本。

Unity有两种.NET API兼容方式，默认为.NET Standard，还有一个是.NET Framework。一开始我还不清楚dynamic是.NET Framework下的API，于是错误的把netcoreapp3.1导入进来。后来发现需要使用dynamic关键词，于是切换成net462版本，并且将Unity的API Compatibility Level设置为.NET Framework。

导入完成之后会发现Unity会报错提示一堆错误，包括但不局限于找不到指定包、assembly冲突等等。我简单看了一下发现我导入了不少测试用的assembly，因此我前去Github对IronPython进行了一次fork并且克隆自行编译一次（当然，这次编译是不包含WFP包和Test包等与IronPython运行没有直接关联的包）。剔除掉IronPython的可执行文件，导入完成之后理论上应该不会有更多的报错了，但是我使用的平台是Apple Silcon M1 Pro，所以我还要对每一个dll修改macOS平台适配为Universal。

至此，我们就完成了IronPython的导入工作，并且可以调用到运行时相关库。

## IronPython的使用（从C#调用Python代码）

使用Python的办法非常简单，只需要导入IronPython库就可以用一行实现调用：

```csharp
using IronPython.Hosting;
using UnityEngine;
...

var calculation = Python.CreateEngine().Exeute<int>("1 + 1");
Debug.Log(calculation); // Print: 2
```

这里的`Execute<int>("1 + 1")`便是在使用Python计算1 + 1的结果是多少。除了这种一行一行执行的方法，我们还可以使用`ExecuteFile`这个函数读取一个文件，并且使用这个文件作为脚本执行Python代码，比如这样子（注意，先创建好StreamingAssets文件夹，否则执行会报错）：

```csharp
using System.IO;
using Exodrifter.UnityPython;
using UnityEngine;
...

var pyScript =
@"def Call(a:int):
    return a + 1
";
var path = Application.streamingAssetsPath + "/test.py";

var writer = File.CreateText(Application.streamingAssetsPath + "/test.py");
writer.Write(pyScript);
writer.Close();

var engine = Python.CreateEngine();
dynamic py = engine.ExecuteFile(path);
var result = py.Call(3);

Debug.Log(result); // Print: 4
```

在这里你会注意到，我使用了`dynamic`关键词（用不了记得检查API Compatibility Level），使得我可以直接用函数名称的方式去调用Python文件中所定义的函数。同时`ExecuteFile`这个方法返回的并不是某个表达式所返回的特定数值，而更像是返回了某个模块，有点类似Python中导入模块并直接使用模块名称去调用功能的感觉：

```python
import sys

print(sys.version) # just like previous call in C# : py.Call(3)
```

那么我们可以这样子理解，如果我们需要使用Python执行一个调用，那么我们只需要用Execute即可，如果我们需要将一个文件当作一个模块使用，那么我们就用`ExecuteFile`。那么如果我们需要将一段String当作一个模块使用，那么是不是应该像这样使用呢：

```csharp
using System.IO;
using Exodrifter.UnityPython;
using UnityEngine;
...

var pyScript =
@"def Call(a:int):
    return a + 1
";

var engine = Python.CreateEngine();
dynamic py = engine.Execute(pyScript);
var result = py.Call(3); // Is this correct?

Debug.Log(result); // Print: 4
```

我帮你试了，答案是不可以。这么做只能返回一个null给你，你什么也做不了。那么我们使用ExecuteFile的时候，返回的是什么东西？

## IronPython将String加载为模块的方法

`ExecuteFile`返回的是`ScriptScope`，也就是说如果我也同样返回一个`ScriptScope`，那么我就可以实现将String加载为模块的目的，从而可以和Unity的其他部分链接起来，形成一个整体。于是我去翻看了一下`ExecuteFile`与`Execute`这两个个函数的具体代码，并且定位到了这个函数：

```csharp
// Decompile: Microsoft.Scripting.Hosting.ScriptEngine

/// <summary>
/// Executes an expression. The execution is not bound to any particular scope.
/// </summary>
/// <exception cref="T:System.NotSupportedException">The engine doesn't support code execution.</exception>
/// <exception cref="T:System.ArgumentNullException"><paramref name="expression" /> is a <c>null</c> reference.</exception>
public object Execute(string expression) => this.CreateScriptSourceFromString(expression).Execute();

/// <summary>Executes an expression within the specified scope.</summary>
/// <exception cref="T:System.NotSupportedException">The engine doesn't support code execution.</exception>
/// <exception cref="T:System.ArgumentNullException"><paramref name="expression" /> is a <c>null</c> reference.</exception>
/// <exception cref="T:System.ArgumentNullException"><paramref name="scope" /> is a <c>null</c> reference.</exception>
public object Execute(string expression, ScriptScope scope) => this.CreateScriptSourceFromString(expression).Execute(scope);

/// <summary>
/// Executes content of the specified file in a new scope and returns that scope.
/// </summary>
/// <exception cref="T:System.NotSupportedException">The engine doesn't support code execution.</exception>
/// <exception cref="T:System.ArgumentNullException"><paramref name="path" /> is a <c>null</c> reference.</exception>
public ScriptScope ExecuteFile(string path) => this.ExecuteFile(path, this.CreateScope());

/// <summary>
/// Executes content of the specified file against the given scope.
/// </summary>
/// <returns>The <paramref name="scope" />.</returns>
/// <exception cref="T:System.NotSupportedException">The engine doesn't support code execution.</exception>
/// <exception cref="T:System.ArgumentNullException"><paramref name="path" /> is a <c>null</c> reference.</exception>
/// <exception cref="T:System.ArgumentNullException"><paramref name="scope" /> is a <c>null</c> reference.</exception>
public ScriptScope ExecuteFile(string path, ScriptScope scope)
{
  this.CreateScriptSourceFromFile(path).Execute(scope);
  return scope;
}
```

这个this对象所指的就是我们通过`Python.CreateEngine`所获取到的`ScriptEngine`对象，观察`ExecuteFile(string path)`这个函数可以发现，它实际上包装了函数`ExecuteFile(string path, ScriptScope scope)`。可以联想到，如果我们也一样创建一个Scope并且传递给`Execute(string expression, ScriptScope scope)`，那么会不会就和`ExecuteFile`的效果一样了呢？那么我们创建这样子的脚本来让一段String当作模块被IronPython加载试试看：

```csharp
var pyScript =
@"def Call(a:int):
    return a + 1
";

var engine = Python.CreateEngine();
var scope = engine.CreateScope(); // Create Scope from ScriptEngine
engine.Execute(pyScript, scope);
dynamic py = scope;
var result = py.Call(3);

Debug.Log(result); // Print: 4
```

对的，这次成功了！也就是说如果我们通过`ScriptEngine`创建一个`ScriptScope`，并且将其作为参数传递给`Execute`的话，那么我们传递进去的Scope便可以实现dynamic的方式调用对象！

不过这个地方，我个人认为有一个更加准确的定义方法是：我们创建一个作用域，然后让代码在这个作用域内执行，其执行产生的副作用可以通过对作用域直接访问获得。

## 从Python直接调用C#代码

从官方的介绍来看，他们认为这种方式是比较OK的：

```python
import clr
clr.AddReference('UnityEngine')

from UnityEngine import *

def Log(msg:str) -> None:
  Debug.Log(msg)
```

但是我几番尝试过后还是没有成功调用到UnityEngine的代码，于是我选择另辟蹊径，我从C#这边下手。我搜寻之后发现，C#下的`ScriptEngine.Runtime.LoadAssembly`可以从C#这边手动将Assembly加载到Python中去，因此我把启动Python引擎的代码修改为：

```csharp
using System.IO;
using Exodrifter.UnityPython;
using UnityEngine;
...

var pyScript =
@"from UnityEngine import *
def Log(msg:str) -> None:
    Debug.Log(msg)
";

var engine = Python.CreateEngine();
engine.Runtime.LoadAssembly(typeof(UnityEngine.Object).Assembly);
dynamic py = engine.Execute(pyScript);
py.Log("Test") // Print: Test
```

经过测试，我们可以成功的在Python中无缝的调用C#方法。并且数据结构也可以直接的使用或者操作（挺不错的）

## 那么，代价呢？

### IL2CPP兼容问题

首先第一个最明显的代价是：IronPython是用了System.Reflection.Emit这个库实现Python到C#的无缝调用，也就意味着我们无法在任何禁止了动态代码运行或者在使用IL2CPP的平台上运行，比如各家主机平台和iOS平台。所以这个方案比较适合桌面应用的开发，比如与AI相关的应用。

不过这个问题也有解决的可能性，我目前还在研究中。并且似乎IronPython.Module库在IL2CPP过程中会出现与System.Reflection.Emit无关的错误，目前还没有解决方法。

### 性能问题

其次是性能代价。由于我们上述代码的执行时机一般都在Unity主线程（PlayerLoop中），因此如果在一些性能敏感的场景中时，我们必须要注意Python代码的运行速度。因此我在我的平台上（macOS 13 + M1 Pro）进行了性能测试。下面是我的测试方法：

- 操作内容尽可能贴近正常编写脚本的情况，也就是会产生大量Python与C#互相调用，而且会操作不少Unity API。
- 统一使用Stopwatch进行时间测量。
- 为了去除掉IronPython加载代码所需要的时间，我们预先让IronPython加载完成后通过调用函数启动测试例子。
- Unity切换到Release Mode。
- 为了方便环境配置，使用包装好的[Cardidi/unity-python](https://github.com/Cardidi/unity-python)来构造代码。
- 同Batch数的测试不退出Unity的运行模式。
- 如果运行时间为0，那么我们视为1以方便计算。

下面是测试代码：

```csharp
using System.Diagnostics;
using Exodrifter.UnityPython;
using UnityEngine;
using Debug = UnityEngine.Debug;

public class PythonExample : MonoBehaviour
{
    [SerializeField]
    private int batch = 100;

    private dynamic py;

    private string benchmarkScript = @"from UnityEngine import *

def test(batch:int) -> None:
    a = 0
    b = Vector3()
    rotate = Quaternion.Euler(32.5, 22.45, 12.54)
    while a < batch:
        a += 1
        b += Vector3.one
        b = rotate * b
        obj = GameObject()
        obj.name = f'Py {a}'
";

    void Start()
    {
        // Compile scripts
        var engine = UnityPython.CreateEngine();
        py = engine.ExecuteString(benchmarkScript);
    }

    [ContextMenu("Start Testing")]
    void Test()
    {
        var stoptimer = Stopwatch.StartNew();
        py.test(batch);
        var pt = stoptimer.ElapsedMilliseconds;

        stoptimer.Restart();
        CSTest(batch);
        var ct = stoptimer.ElapsedMilliseconds;
        stoptimer.Stop();

        Debug.Log($"Py: {pt}ms, C#: {ct}ms");
    }

    private void CSTest(int batch)
    {
        var a = 0;
        var b = new Vector3();
        var rotate = Quaternion.Euler(32.5f, 22.45f, 12.54f);
        while (a < batch)
        {
            a++;
            b += Vector3.one;
            b = rotate * b;
            var obj = new GameObject();
            obj.name = $"C# {a}";
        }
    }
}

```

下面是测试数据

**Batch数量****测试轮次****Python用时（ms）****C#用时（ms）****开销比例**1147047.0012001.0013001.0010152052.00102001.00103102.00100156056.00100211011.001003102.001000167416.75100021052.00100031262.00100001131393.3610000292412.2410000390352.57

如果仔细观察的话，会发现数据大致呈现为这样的一个状态：

- 第一次运行Python函数的开销最大，特别在运行简短代码时，这个开销产生的影响更加明显。
- Python的稳定开销和运行C#脚本的开销基本呈现约等于2.5:1的关系。
- 无法确定在低batch数下的运行实际用时。

那么如果我修改测试条件中的“同Batch数的测试不退出Unity的运行模式”，情况会变成什么样子呢？顺带一提，我此处也同步修改了Stopwatch计时方法，我不继续使用`stoptimer.ElapsedMilliseconds`继续获取时间，而是使用`stoptimer.ElapsedTicks`获取更加精准的数据。

**Batch数量****测试轮次****Python用时（tick）****C#用时（tick）****开销比例**115094351769287.98122407141017.0713663520033.18104597052011.4810583988469.93106861918104.76100783053688212.0710081772091871.93100926415132981.99100010129145583812.21100011104262501122.08100012133812510962.6210000139540564007952.3810000149445284275742.2110000158987683642462.47

如果抛开每一个batch数的第一个数据计算平均值，我们可以得到下面这张表格：

**Batch数量****平均开销比例**125.12107.341001.9610002.3510002.34

由此我们的结论又要发生变化：

- 在运行较少Python代码的情况下，性能开销不划算，特别在Batch为1时的性能开销会非常的糟糕。
- 当batch数量足够高时，Pyhton与C#的性能开销比例大约在2.3这个水平。
- 第一次运行某个包含C#调用的函数时性能开销最大。
- 考虑到脚本编写者很有可能会编写一次运行且短小的脚本，这个方案的性能开销可能会太大了。

## 结论

那么我最终用上这个方案了吗？没有，因为我们计划要在Nintendo Switch上发行，而且这个平台仅支持IL2CPP模式，因此最终作罢。我最后通过魔改我们的剧情编辑工具，为其添加了函数支持才解决了这个问题。
