---
title: 育碧实习C++笔试题：如何在没有调试信息的条件下修复BUG
tags:
  - C++
  - 指针
  - 笔试
  - 育碧
createTime: '2023-09-29 15:24:08'
permalink: /article/tech/ubisoft-testing-debug-without-debugging-info/
---
这个是我做育碧C++笔试的最后一道题，原题如下：

You've been working on a game for the last year and it is finally due to be sent to Sonisoft for testing. Right before sending it off for verification, disaster strikes! Your testers find a random crash. Given that this is a final release build, it doesn't contain any symbols, nor debug information. List at least 3 ways that you might debug and fix the cause of the crash.

我作为一位学了几年Unity但是没咋做过C++的开发者，我的第一时间想到的就是这几个经典的方法：

- 检查日志文件，确认是在什么过程中出错。
- 重新打包一份Debug版本的游戏，然后用Debug版本复现问题并追踪调试。

但是，这个问题还有一个条件是给出三个解决思路。诚然，在我认知中我还真想不到其他的办法了。我缺少C++开发经验（所以育碧这个C++投过去主要是想试试水），所以去群里面问了一下，给我了一个我没想到的情况：性能问题。

C++经典问题是内存泄漏，比如我昨天看见的这种逆天写法：

```cpp
int i = *(new int(5));
```

我作为一名被GC代管内存养惯的程序员，自然不会第一时间想到需要释放内存的问题，所以当我第一次看见这个逆天代码还没有反应过来，但是定睛一看才发现：为什么在堆上申请了内存之后，把堆的值拷贝到栈上后，就丢弃了指针？这完全就没法操作了；或者说，为什么要这样子给i赋值？？？

所以，我作为从C# 转向C++ 的程序员，重点需要关注的地方还是这个啊……
