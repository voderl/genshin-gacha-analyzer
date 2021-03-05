# Genshin Gacha Analyzer | 原神抽卡记录分析工具

## 如何获取xlsx文件？
sunfkny的[抽卡记录导出工具](https://ngabbs.com/read.php?tid=25004616)  
lvlvl的[electron版抽卡记录导出工具](https://ngabbs.com/read.php?tid=25559039)，导出数据后选择导出Excel

## 网址
https://genshin-gacha-analyzer.vercel.app/

如果你有一些建议或者想法，欢迎在[issue](https://github.com/voderl/genshin-gacha-analyzer/issues)中提出  
你的建议非常重要，谢谢~

## Available Scripts

In the project directory, you can run:
### `yarn`
Install

### `yarn start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## TODO:
1. 增加更多的成就，并限制展示条件。 
   如果你对成就有建议可以在[issue](https://github.com/voderl/genshin-gacha-analyzer/issues)中提出。
2. 饼图可以导出为图片
3. 进一步重构，由于项目开始时的个人能力与规划问题，代码需要进一步重构


## 更新
* 3.06
  * 饼图，参考自[nga链接](https://ngabbs.com/read.php?tid=25559039)
  * 增加全局缓存，避免因Menu和Tabs的切换而造成多次计算
* 3.05
  * 手机端更好的展示，现在勉强能用了
  * fix #4
* 2.25
 // 希望成就能展示更多正面的东西，让大家开心
  * 「欧皇在世」(<=10抽显示)  =>  「欧皇时刻」(<=30抽显示)
  * 「豪掷千金」(最多抽数的一天) =>  「豪掷千金」(最多抽数的一天，如果没出黄则不展示)
  * 「仓鼠」文案修改，节点分别为 15天，30天，60天
  * 「情有独钟」在获取角色的数量为1时，不展示
* 2.23
  * 由于仅需要xlsx格式支持，更换xlsx.mini.min.js, 打包大小 -1M (最开始就试过换mini了，不过当时报错，现在可以正常使用了，不懂什么原因，迷惑
  * 成就页可以生成所获得成就的png图片
  * 一些ui上的优化，成就文案上的调整
* 2.22
  * 字体采用了汉仪文黑的非商业授权版本，实现了字体打包，从而在100k左右大小的情况下引入了中文字体。
  * 成就展示页的样式调整，ui看起来更好看了(×  
* 2.21 
  * 在角色活动祈愿，武器活动祈愿中，筛选按钮增加往期Up池筛选
  * 成就增加 小保底是否歪了 相关成就，并修改部分成就的显示条件(有些成就不满足条件不显示)