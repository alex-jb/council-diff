# council-diff

> [English](README.md) · [中文](README.zh-CN.md)

### Software 3.0 参考实现 · 多人格 AI agent 的开源评估闭环

> **"传统软件自动化的是你能精确指定的东西。AI 自动化的是你能验证的东西。"**
> Andrej Karpathy, Sequoia AI Ascent, 2026 年 4 月 20 日

> **"Agentic 工程师做的事:写规格、监督计划、检查 diff、写测试、搭建评估闭环、管理权限、隔离 worktree、守住质量。"**
> Karpathy, 同一场演讲

council-diff 是多人格 agent 最小可复现的**评估闭环**。粘一个决策进来,5 个人格并行给出判决,看他们在哪里分歧,可选让 Fable 5 Oracle 做仲裁,结果出来后对每个 voice 做 Brier 审核。v0.3.0 早 Anthropic "advisor strategy" beta 6 个月。MIT 许可,npm 上可装。

## 为什么这是一个 Software 3.0 工件

Karpathy 把软件历史划成三个时代:

- **Software 1.0**:显式写出来的代码
- **Software 2.0**:训练出来的神经网络
- **Software 3.0**:给 LLM 解释器写 prompt

Software 3.0 没有编译器报错,没有单元测试能抓住幻觉。工作描述变了。Agentic 工程师写的规格要精确到歧义无处藏身,然后搭建**评估闭环**抓住模型偏移的那一刻。

council-diff 直接映射到那一条:

| Karpathy 描述的工作 | council-diff 对应原语 |
|---|---|
| 写出歧义无处藏身的规格 | 每个 domain 5 个 persona brief,每个都显式声明偏见 |
| 检查 diff | 每个 persona 的 `voice.verdict` + `voice.strength` + `voice.gap` 并排展示 |
| 写测试 | `agreement_score` 就是测试。1.0 一致、0.0 分裂 |
| **搭建评估闭环** | **Brier 审核模块。结果出来后每个 voice 都打分,30 / 90 天追踪校准度** |
| 管理权限 | `safeMode: true` 强制零留存 Sonnet 4.6,每次调用都返回 `data_retention` |
| 守住质量 | Oracle 层。Fable 5 读完 5 个判决再仲裁,单独 Brier 审核 |

Persona-vs-persona 格式是规格。Agreement score 是测试。Brier 审核是评估闭环。Oracle 是 supervisor。一个 OSS 库,一次调用 5 个判决,约 $0.03。

## 它做什么

单 LLM 的判决会把自己的不确定性藏起来。一个模型 90% 自信和 5 个专家分歧的 90% 自信,信号完全不同。council-diff 把分歧暴露出来。

6 个内置 domain:

- **founder**:YC Partner / VC 怀疑者 / 律师 / Indie CFO / 务实配偶
- **engineer**:Rust 核心 / SRE oncall / 招聘 / 新入职 junior / 5 年后 CTO
- **investor**:宏观策略 / 行业分析 / PM / 成长 VC / 做空激进派
- **career**:20 年职业资本 mentor / 顶级 recruiter / 同辈干得好的 / 你的 CSO / 5 年后的你
- **product**:真实 user / 竞品 PM / 写代码的内部 dev / Garry 风 / Naval 风
- **quant**:Jane Street MD / Citadel / Two Sigma ML / Anthropic / HFT 工程师

加 `custom` 完全自定义 voice 列表。

## 真实案例研究 — 完整 GO → KILL 谱

2026-06 真实 `council.deliberate()` 开火 4 次。同引擎,四种 verdict shape。**问题的形状决定了 verdict 的形状** — 一致度是校准信号。

| 案例 | 域 | 推荐 | 一致度 | 声音分差 | 例子 |
|---|---|---|---|---|---|
| [加密支付 (B2B SaaS 零需求)](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/crypto-payments-2026-06.md) | founder | **KILL** | **0.94** | 4 → 12 (8 分,最窄) | `examples/founder-crypto-payments.ts` |
| [年付 (送 2 个月)](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/annual-billing-2026-06.md) | founder | GO | 0.89 | 72 → 88 (16 分) | `examples/founder-annual-billing.ts` |
| [GOOGL Q3 2026 (Druckenmiller vs Berkshire)](./docs/case-studies/googl-q3-2026.md) | investor | WAIT | 0.78 | 38 → 72 (34 分) | `examples/investor.ts` |
| [Rust 重写 Python inference router](https://github.com/alex-jb/council-for-slack-2026/blob/main/docs/case-studies/rust-rewrite-2026-06.md) | engineer | WAIT | 0.62 | 22 → 72 (50 分,最宽) | `examples/engineer-rust-rewrite.ts` |

一致度区间 **0.62 → 0.94**。声音分差区间 **8 → 50 分**。Verdict 覆盖 GO / WAIT / KILL 全谱。

本地复现任一案例:

```bash
ANTHROPIC_API_KEY=sk-... npx tsx examples/founder-crypto-payments.ts
```

每次开火 ~$0.03, ~10 秒。**Verdict 不是为了多样性挑的** — 这 4 个案例是开火前按问题形状多样性挑的。最紧的一致度 (0.94, 8 分分差) 出现在 KILL 上 — 这本身就是校准声明: 当每个框架都收敛反对,council 比任何单个 GO 都收敛更紧。

## 安装

```bash
# npm (TypeScript / Node) — v0.4.2 audit-clean, 0 vulns
npm install council-diff

# skills.sh — 跨 71 个 AI agent 平台分发
# (Amp, Antigravity, Antigravity CLI, Claude Code, Cline, Codex, Cursor,
#  Deep Agents, Gemini CLI, GitHub Copilot, Kimi Code CLI, Open Code,
#  Warp, Zed,+57 个)
npx skills add alex-jb/council-diff
```

## 快速开始

```ts
import { CouncilDiff } from "council-diff";

const council = new CouncilDiff({ apiKey: process.env.ANTHROPIC_API_KEY });

const result = await council.deliberate({
  domain: "founder",
  decision: "我应该 raise $1M 种子轮还是 bootstrap?",
  context: "B2B SaaS, $5K MRR, 月增 20%, solo 创业, 12 个月 runway",
});

console.log(result.recommendation);  // "go" | "wait" | "kill" | "split"
console.log(result.agreement_score); // 0-1, voices 同意程度
console.log(result.consensus);       // 1 段综合判断

for (const v of result.voices) {
  console.log(`${v.voice_display} (${v.score}/100): ${v.verdict}`);
  console.log(`  + ${v.strength}`);
  console.log(`  - ${v.gap}`);
}
```

## Oracle 模式 (Fable 5)

难判的决策、议会分裂、或者想要旗舰级第二意见的时候,开 Oracle:

```ts
const result = await council.deliberate({
  domain: "founder",
  decision: "上 hosted SaaS $29/mo 还是继续 OSS-only?",
  context: "11-agent OSS stack, ~50 stars, 3 个付费 customer 求托管",
  oracle: "fable-5",  // opt-in
});

console.log(result.recommendation);          // 议会投票
console.log(result.oracle?.recommendation);  // Fable 5 投票
console.log(result.oracle?.verdict);         // 2-3 句,指出站在哪一边
console.log(result.oracle?.override_reason); // Oracle 推翻议会时才有
```

议会先辩论(Sonnet 4.6, 5 voices, 约 $0.03)。然后 Fable 5 读完 5 个判决和综合判断,用 Mythos 级推理预算权衡,要么批准议会要么推翻并说明理由。额外 ~$0.05-0.08 每次。

值不值得用看决策本身的代价。常规决策不开,关键决策开。

试一下: `ANTHROPIC_API_KEY=... npm run example:oracle`

### 数据留存披露

Anthropic 对 **Mythos 级模型(Claude Fable 5, Opus 4.7-Mythos)实行服务端 30 天数据留存政策**,详见[官方支持文章](https://support.claude.com/en/articles/15425996-data-retention-practices-for-mythos-class-models)。5 voices 基础议会用的是 Sonnet 4.6,在标准企业条款下是**零留存**。

v0.3.1+ 起每个 Oracle 返回值都带实际状态:

```ts
result.oracle?.data_retention  // "30day-mythos" 或 "zero"
result.oracle?.downgraded      // safeMode 强制降级时为 true
```

如果应用有任何与 30 天留存冲突的隐私承诺(心理健康日记、"端侧零上传" 营销、GDPR 敏感 PII、保密商业决策),传 `safeMode: true`,Oracle 自动降级到 Sonnet 4.6:

```ts
const council = new CouncilDiff({ safeMode: true });

const result = await council.deliberate({
  domain: "founder",
  decision: "...",
  oracle: "fable-5",  // 请求
});

result.oracle?.model         // "claude-sonnet-4-6", 实际跑的
result.oracle?.downgraded    // true
result.oracle?.data_retention // "zero"
```

这条披露不是可选的。council-diff 的定位是校准诚实。如果走了 Mythos 路线却不把留存边界亮出来,这个定位就站不住。

## 自定义 voice

```ts
const result = await council.deliberate({
  domain: "custom",
  decision: "新服务用 Postgres 还是 DynamoDB?",
  context: "峰值 1万 写/秒, 接受最终一致, 团队 SQL 熟",
  custom_voices: [
    { slug: "dba", display: "Postgres DBA", role_brief: "几十年 OLTP 经验, 偏好 PG 适配 95% 工作负载" },
    { slug: "aws_se", display: "AWS Solutions Engineer", role_brief: "DynamoDB 狂热者, 偏好 serverless > 自管" },
    { slug: "kafka_dev", display: "Kafka Streams Dev", role_brief: "事件溯源视角, 偏好写 log 然后投影" },
    { slug: "cost_eng", display: "成本工程师", role_brief: "看账单的, 偏好 serverless 在规模上贵 5x" },
    { slug: "former_cto", display: "经历过 3 次迁移的前 CTO", role_brief: "都做过, 偏好留在团队熟悉的栈" },
  ],
});
```

## 输出结构

```ts
interface CouncilResult {
  domain: CouncilDomain;
  decision: string;
  voices: {
    voice: string;          // slug
    voice_display: string;  // 显示名
    score: number;          // 0-100, 支持强度
    verdict: string;        // 1-2 句话
    strength: string;       // 最强支持信号
    gap: string;            // 最大风险
  }[];
  consensus: string;            // 1 段综合 (60-100 字)
  agreement_score: number;      // 0-1, 1=一致, 0=分裂
  recommendation: "go" | "wait" | "kill" | "split";
  computed_at: string;
  oracle?: {
    model: string;
    recommendation: "go" | "wait" | "kill" | "split";
    score: number;
    verdict: string;
    override_reason?: string;
    data_retention?: "30day-mythos" | "zero";
    downgraded?: boolean;
  };
}
```

## 成本

- **只用议会:** 一次 Sonnet 4.6 调用,约 $0.02-0.04
- **议会 + Oracle:** 加一次 Fable 5 调用,约 $0.05-0.08 额外。总共 ~$0.07-0.12

## Brier 审核:评估闭环

这是 council-diff 之所以是 Software 3.0 工件而非 prompt 包装的关键。每次决策都可以在决策时记录、在结果出来时打分。Brier 分数(0 完美、1 最差、0.25 随机抛硬币)告诉你议会是真的校准还是只是嘴硬。

```ts
import { addPrediction, resolvePrediction, brierScore, meanBrier } from "council-diff/brier";

// 决策时记录:
const pred = addPrediction({
  decision: result.decision,
  domain: result.domain,
  recommendation: result.recommendation,
  agreement_score: result.agreement_score,
  voice_scores: result.voices.map((v) => v.score),
  resolve_by: "2027-06-09",  // 12 个月后审核
});
// 持久化到 JSONL / SQLite / Postgres 任你选。

// 结果出来后:
const resolved = resolvePrediction(pred, { outcome: "go-was-right" });
const score = brierScore(resolved);  // 0=完美, 1=最差, 0.25=随机

// 多个 prediction 聚合:
const audit = meanBrier(allResolvedPreds);
console.log(audit.edge_vs_random);  // 正数 = council 比随机有校准价值
```

详见 `src/brier.ts`。Oracle 调用单独 Brier 审核,这样能看到 Oracle 什么时候赢议会、什么时候输给议会。

## 跟现有工具的区别

**Perplexity Model Council (2026-02)** 是闭源 UI 功能,把*同一个问题*放到*不同 provider*(GPT-5.2 vs Claude 4.6 vs Gemini)上对比。council-diff 是 OSS 库,把*不同 persona*放到*同一个模型*上对比,Fable 5 Oracle 仲裁,Brier 审核模块对每个 voice 在 30 / 90 天追踪。Persona 维度而不是 provider 维度。用现实闭环。

**Anthropic 2026-06-09 发布了 "advisor strategy" beta。** 同样的 pattern,晚 6 个月。Anthropic 2026 年 6 月的 Skills release 加了 "advisor strategy" 模式,agent 在决策前先咨询一个 advisor 模型。这正是 council-diff 自 v0.3.0 起做的事:5 voices 议会咨询、Fable 5 Oracle 仲裁、Brier 审核闭环。Pattern 早了 6 个月,而且仍是唯一一个把校准层一起 ship 出来的 OSS 实现。跟官方 Skills 标准无缝兼容,把 `council-diff` 放到任意 `.claude/skills/` 目录就自动 load。

## Pattern 来源

- [Karpathy, Sequoia AI Ascent, 2026 年 4 月 20 日](https://www.youtube.com/results?search_query=karpathy+sequoia+ai+ascent+software+3.0)。Software 3.0 框架 + agentic engineering 工作描述。
- [Perplexity Model Council UI](https://www.perplexity.ai/hub/blog/perplexity-model-council)
- [Orallexa 多 agent 辩论](https://github.com/alex-jb/orallexa-ai-trading-agent)
- Cohere Command A+ 引用 pattern (来源以 `[src:...]` 形式内嵌)

## 路线图

- [x] Brier 审核数学 (v0.2)
- [x] Fable 5 Oracle 仲裁 (v0.3)
- [x] 数据留存披露 + safeMode (v0.3.1)
- [x] Karpathy Software 3.0 定位 (v0.4)
- [ ] 公开 Brier 榜单 council.alex-jb.com
- [ ] 按 voice 流式输出供 UI
- [ ] Python 移植 (`pip install council-diff`)
- [ ] CLI: `council "我该不该辞职" --domain career`

## 许可

MIT
