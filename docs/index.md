# Niumer CLI

Niumer CLI 用来统计本地多个 Git 代码仓在指定时间范围内的作者代码量。

默认命令会：

- 扫描当前目录以及当前目录下的一级子目录，寻找 Git 仓库根目录。
- 从 `git config user.name` 读取作者名。
- 使用当年 `01-01` 到 `12-31` 作为统计时间范围。
- 通过 `git rev-list` 和 `git log --numstat` 汇总代码提交、文件变更、插入行和删除行。

## 快速开始

```bash
npm i @harvey0379/niumer-cli -g
niumer count
```

本地开发：

```bash
pnpm install
pnpm --filter @harvey0379/niumer-cli build
pnpm --filter @harvey0379/niumer-cli dev -- count
```

构建后也可以直接运行：

```bash
node packages/cli/dist/index.js count
```

## Monorepo 结构

```text
.
├─ packages/
│  └─ cli/        # niumer 命令实现
├─ docs/          # VitePress 文档站点
└─ .github/
   └─ workflows/ # GitHub Pages 部署
```

下一步阅读 [niumer count](./guide/count.md) 了解统计命令的参数和输出。
