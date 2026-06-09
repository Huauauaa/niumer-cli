# niumer count

`niumer count` 会统计当前目录下各个 Git 仓库中指定作者在指定时间范围内的代码量。

## 默认行为

```bash
niumer count
```

默认值：

- `author`：从当前环境的 `git config user.name` 读取。
- `timerange`：当前年份的 `01-01..12-31`，例如 `2026-01-01..2026-12-31`。
- `cwd`：当前工作目录。

## 参数

| 参数                       | 说明                                                      |
| -------------------------- | --------------------------------------------------------- |
| `--author <name>`          | 指定 Git author，支持 `git log --author` 可接受的匹配值。 |
| `--timerange <start..end>` | 指定统计区间，例如 `2026-01-01..2026-06-30`。             |
| `--since <date>`           | 指定起始日期，会覆盖 `timerange` 的起始值。               |
| `--until <date>`           | 指定结束日期，会覆盖 `timerange` 的结束值。               |
| `--cwd <path>`             | 指定要扫描的目录。                                        |
| `--json`                   | 输出 JSON，便于脚本消费。                                 |

## 示例

统计当前年份：

```bash
niumer count
```

统计某个季度：

```bash
niumer count --timerange 2026-01-01..2026-03-31
```

统计指定作者：

```bash
niumer count --author "Jane Doe" --since 2026-01-01 --until 2026-12-31
```

输出 JSON：

```bash
niumer count --json
```

## 输出字段

默认表格输出包含：

- `Repository`：仓库目录名。
- `Commits`：匹配作者和时间范围的提交数。
- `Files`：匹配提交中的文件变更条目数。
- `Inserted`：插入行数。
- `Deleted`：删除行数。
- `Total`：插入行数与删除行数之和。

统计基于 Git 命令：

```bash
git rev-list --count --author=<author> --since=<start> --until=<end> HEAD
git log HEAD --author=<author> --since=<start> --until=<end> --pretty=format: --numstat
```
