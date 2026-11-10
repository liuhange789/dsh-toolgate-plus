# dsh-toolgate-plus

会话阶段感知的动态工具准入插件。监听 `tools/pre-execute`，用最近 5 次工具调用判断当前处于探索、编辑还是调试阶段，并在阶段切换时给出一次性建议。

- Host 侧：`inject: ['tools']`，记录工具名与调用序列，阶段切换时调用 `agent.followup()`，并把阶段快照写入宿主日志
- 不含浏览器 UI：1.0.0 里的 `statusBar` / `hintArea` / `settings` 挂载在 DSH 中并不存在，且 client 产物不是 `__ModuleLoader__` 可加载的 bundle，已整体移除；用户可见的一行建议改由 `agent.followup()` 送达
- 不做面板图表，不改变工具准入决策（监听器始终调用 `next()`）

## 安装

npm 包名是 `@liuhange/dsh-toolgate-plus`。优先用宿主自带的插件安装命令：

```bash
dsh plugin add @liuhange/dsh-toolgate-plus
```

也可以直接从 GitHub 仓库安装并本地构建：

```bash
git clone https://github.com/liuhange789/dsh-toolgate-plus.git
cd dsh-toolgate-plus
npm install
npm run build
```

构建产物：

- `host/dist/index.js` / `host/dist/index.d.ts`

## 注册进宿主

本工程按 DSH both-mode 插件约定组织，`package.json` 中声明了：

```json
"dsh": {
  "bundle": { "patch": "./cordis.patch.yml" }
}
```

`cordis.patch.yml` 使用官方 `insert` 格式：

```yaml
- insert:
    - id: "@liuhange/dsh-toolgate-plus"
      name: "@liuhange/dsh-toolgate-plus"
```

安装步骤：

1. 执行 `dsh plugin add @liuhange/dsh-toolgate-plus`，或把构建后的工程放入 DSH 插件目录，例如 Windows 下：

   ```powershell
   Copy-Item -Recurse -Force "D:\dsh-toolgate-plus" "$env:USERPROFILE\.dsh\plugins\dsh-toolgate-plus"
   ```

2. 宿主读取 `package.json` 的 `dsh.bundle.patch` 并加载 `cordis.patch.yml`；不需要手工编辑宿主 patch 文件。

3. 重启 DSH，在插件设置页确认 `@liuhange/dsh-toolgate-plus` 已启用。

Host 侧依赖 `@deepseek-ai/schemastery`，已在 `peerDependencies` 中以可选 peer 声明，由 DSH 宿主提供（宿主 `profiles/node_modules` 里已有该包，Node 向上查找可解析）。

## 输出位置

| 位置 | 内容 |
|---|---|
| 会话消息流 | 阶段切换建议，单行文本，由 `agent.followup()` 作为插件消息送达 |
| 宿主日志 | 每次阶段切换记录 `stage` / `icon` / `suggestion`，供排查与观测 |

`autoCollapse` 在移除浏览器 UI 后已不影响输出（保留配置键是为了不破坏已有配置文件）；建议消息仍受每阶段 60 秒节流控制。

## 阶段判定

每次 `tools/pre-execute` 记录工具名，只保留最近 5 次调用（滑动窗口）。超过 5 条时淘汰最早一条，然后对整个窗口重新统计。

判定优先级：窗口尾部连续调试调用 > 编辑占比 > 探索占比 > 保持当前阶段。未达到任何阈值时保持现状，避免单次调用造成抖动。

### 标准档阈值

| 阶段 | 判定条件（窗口长度 5） |
|---|---|
| 探索 | read/search/list 类工具占比 > 60%，即至少 4/5 |
| 编辑 | write/edit/patch 类工具占比 > 50%，即至少 3/5 |
| 调试 | bash/test/run 类工具在窗口尾部连续出现 ≥ 2 次 |

工具名会先按分隔符与 camelCase 拆词再归类，例如 `read_file`、`mcp__fs__read_file`、`WebSearch` 归为探索，`str_replace_editor`、`ApplyPatch` 归为编辑，`bash`、`run_tests`、`Shell` 归为调试。`TodoWrite`、`Skill`、`Agent` 等记录型工具归为 neutral，不参与占比。

### 灵敏度差异

| 参数 | 宽松 | 标准 | 激进 |
|---|---|---|---|
| 窗口长度 | 5 | 5 | 5 |
| 探索占比阈值 | > 80% | > 60% | > 50% |
| 编辑占比阈值 | > 60% | > 50% | > 40% |
| 连续调试次数 | ≥ 4 | ≥ 2 | ≥ 2 |

阈值越小越早切换。非法灵敏度配置会回退到标准档并记录告警。

### 建议节流

- 首次进入某阶段立即推送一次建议，并调用 `agent.followup()`
- 同一阶段 60 秒内再次进入时，只更新日志，不再推送建议
- 不同阶段各自独立计时，互不阻塞

## 配置

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `autoCollapse` | boolean | `true` | 建议行是否 10 秒后自动消失 |
| `sensitivity` | `loose` / `standard` / `aggressive` | `standard` | 阶段判定灵敏度 |

配置由 cordis 加载器通过 `configSchema` 校验后传给 `apply(ctx, config)`；运行期不再提供写入 RPC（原 `setPluginConfig` 挂在并不存在的浏览器 RPC 通道上）。

## 验证

```bash
npm test            # 17 个用例
npm run typecheck   # host
npm run build       # host
npm run pack:check  # npm 打包内容校验
```

测试覆盖：

- 探索 / 编辑 / 调试三阶段识别与阶段推进
- 5 条滑动窗口淘汰
- 未达阈值时保持当前阶段的滞回行为
- 宽松 / 标准 / 激进三档阈值差异
- camelCase、MCP 前缀工具名与 neutral 工具归类
- 标签序列判定准确率 8/8
- 同一阶段建议不重复推送、跨阶段互不阻塞、冷却后恢复
- 集成：`tools/pre-execute` 始终 `next()`、`agent.followup()` 消息格式、只声明 `tools` 注入、缺少 `tools` 服务时拒绝加载

## 已知边界

- 工具名归类不全：无明确词根的自定义 MCP 工具归为 unknown，不参与占比；记录型工具已中性化，但新增工具仍可能需要补充词表。
- 阶段回退抖动：只有滑动窗口滞回与每阶段 60 秒节流，没有最短驻留时间或多帧确认。快速来回切换时日志里的阶段会连续变化，但建议不会刷屏。
- 调试判定依赖窗口尾部连续调用。若调试命令之后立即读取文件，可能暂不判为调试阶段。
- `agent.followup()` 依赖宿主在 `tools/pre-execute` 的 exec 上注入 agent；缺失时仅写日志并记录 warn，不阻塞工具调用。
- 权衡项：浏览器侧状态灯 / 设置面板已移除（原实现依赖 DSH 里不存在的 `ctx.ui.*`、`ctx.expose`、`ctx.push`，且产物不是 `__ModuleLoader__` bundle）。替代路径是日志 + `agent.followup()` 消息；如需图形化状态，需要按 DSH 真实 slot API 重做客户端，而不是沿用旧实现。
- 当前仅覆盖探索、编辑、调试三阶段，未包含规划、评审等更多阶段。

## 目录

```
dsh-toolgate-plus/
├── host/src/
│   ├── index.ts                 # Host 入口、inject、生命周期
│   ├── stage/stageDetector.ts   # 滑动窗口阶段检测
│   ├── stage/sensitivityProfile.ts
│   ├── stage/suggestionThrottler.ts
│   ├── stage/toolTaxonomy.ts
│   ├── listeners/toolPreExecListener.ts
│   ├── stageCoordinator.ts
│   └── config/                  # schema + 配置存储
└── test/mocks/schemastery.mjs   # 测试用框架包 mock
```
