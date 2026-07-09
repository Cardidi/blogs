---
title: C#多线程：SychronazationContext学习笔记
tags: null
draft: true
createTime: '2023-03-31 13:57:33'
permalink: /article/tech/c-sychronazationcontext/
---
C#多线程中有一相对重要的概念叫做SychronzationContext，它是用在维系异步机制的重要组成部分。学习后可以对C#的异步机制提出更加高级的定制。

不过感觉写的有点像对MSDN文档的翻译。如果像的话，那么就说明微软牛逼嘛（或者我太菜了）。

## 原始定义

我先从MSDN中找到其原始描述文本。

> The SynchronizationContext class is a base class that provides a free-threaded context with no synchronization.
> The purpose of the synchronization model implemented by this class is to allow the internal asynchronous/synchronous operations of the common language runtime to behave properly with different synchronization models. This model also simplifies some of the requirements that managed applications have had to follow in order to work correctly under different synchronization environments.
> Providers of synchronization models can extend this class and provide their own implementations for these methods.

简单来讲，此类的重要作用在于抽象异步模型，使得上层应用可以使用单一的异步方法在不同的异步模型下正常运作。听起来还是很抽象的，所以还是要看看发展历史才行。

## 发展历史

这一个类的前身是ISynchronizeInvoke。其存在的目的在于，很多的多线程程序会有这样子的一个特征：程序启动时存在一个主线程与数个工作线程（或者称之为子线程），主线程接收到任务之后将任务分派到其他的工作线程上，让工作线程去执行更加具体的任务，从而实现多线程工作的能力。而.NET Framework在第一个版本发布时 ，由于需要应对Windows Form的GUI操作，因此需要将来自Windows Message Loop的消息分发到具体的工作负载上，也就是说，我们的主线程需要将任务“委托”到其他的子线程上。同时这种“委托”方式还存在另外一个特点，我们是否需要等待这一项委托完成（听起来就有点像C#的异步操作了）。

但是到了.NET Framework 2.0的时代，ASP.NET引入了异步页面（Asynchronous Pages），这一种页面方法有一个特点：每当一次请求到达，ASP.NET都需要有一个或者多个线程来处理我们的工作负载，并且还需要等待所有与该请求相关的线程都完成工作才能得到最终结果。这非常明显会加剧线程创建与销毁所产生的开销，同时过大的线程数量也有潜在的风险，因此我们需要引入线程池的方法来回避这一系列问题。

但是为什么我们需要使用SychronizaionContext来替代之前的ISychronizeInvoke呢？区别主要在于是谁在分发任务。在ISychronizeInvoke中，我们多次强调了“主”线程和“子”线程这一对明显具有上下级关系的关键字，但是在ASP.NET引入的异步页面中，发出任务的线程不一定再只是所谓的“主”线程，而执行任务的线程也不一定是所谓的“子”线程，而是各种线程。譬如ASP.NET在异步页面中，发出任务和执行任务的线程可以都是ASP.NET线程池内的线程。

如果采用MSDN原文所描述的，更加具体的说法就是：ISychronizeInvoke是围绕一个线程展开的跨线程任务委托，这不符合ASP.NET所需要的模型。因此我们可以正式提出SychronizationContext的概念了。

## 核心概念

这一个类名字带Context这个单词，也就是说它是一个上下文类。上下文类通常具有什么特点呢？那就是存放运行时需要参考的信息（比如CPU在进行中断操作的时候，会将寄存器状态暂存起来，这时候就是指将当前CPU运行的上下文转存到内存中，以实现任务切换）。同时因为我们将上下文具化到了一个类里面，而不是整个应用程序，所以我们还可以通过拆装上下文的办法实现不同的Worker都能处在同一状态下，但又不至于影响到无关的Worker。

所以，有了异步上下文（SychronizationContext)，我们可以将任务分配给异步上下文，而不再是分配给具体的线程，这是第一个核心概念。

同时我们反向思考，既然有了上下文，那么必然需要有具体的处理器来对上下文中的信息进行解读执行，那么在SychronizationContext中，执行者必然是线程。因此第二个核心概念是：每一个线程都持有一个SychronizationContext，这个上下文可以被不同线程所持有，并且由于拆卸的存在，线程还可以在运行时更换自己所持有的SychronizationContext。

那么这个时候我们就可以开始猜测了，是不是说，我们把任务分发到某个异步上下文，然后持有这个上下文的线程便会去尝试完成分发下来的工作？

## 参考资料

- [SynchronizationContext Class](https://learn.microsoft.com/en-us/dotnet/api/system.threading.synchronizationcontext?view=net-7.0)
- [Parallel Computing - It's All About the SynchronizationContext](https://learn.microsoft.com/en-us/archive/msdn-magazine/2011/february/msdn-magazine-parallel-computing-it-s-all-about-the-synchronizationcontext)
