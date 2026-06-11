# council-diff

> [English](README.md) · [中文](README.zh-CN.md)

**5 个声音 AI 议会**——任何决策粘进来,5 个专家视角并行评估,看他们哪里同意、哪里分歧。在结果出来后做 Brier 审核。

> **v0.3.1 (2026-06-11) — 隐私披露** Oracle 返回值新加 `data_retention: "30day-mythos" | "zero"`。传 `safeMode: true` 让任何 Mythos 级别请求自动降级到 Sonnet 4.6(零留存)。有隐私承诺的应用(心理健康日记、"端侧零上传" 营销、GDPR 敏感 PII)**必须**开启。
>
> **v0.3.0 新功能 (2026-06-10): Fable 5 Oracle 模式** — 传 `oracle: "fable-5"`,5 个声音辩论完之后,[Claude Fable 5](https://www.anthropic.com/news/claude-fable-5) (Anthropic 旗舰 Mythos 级,SWE-Bench 95%,1M context) 会读完所有 5 个判决再下一道仲裁,有权推翻议会共识。议会负责找分歧,Oracle 负责挑站得住的那一边。Brier 单独 audit,这样能看到 Oracle 什么时候赢议会、什么时候输给议会。

Pattern 来源: Perplexity Model Council UI + [Orallexa](https://github.com/alex-jb/orallexa-ai-trading-agent) 量化交易里的 multi-agent debate stack。

## 为什么

单 LLM 给出的"90% 自信"和 5 个专家分歧的"90% 自信"是完全不同的信号。Council-diff 把分歧暴露出来。

5 个内置 domain:

- **founder** — YC Partner / VC 怀疑者 / 律师 / Indie CFO / 务实配偶
- **engineer** — Rust 核心 / SRE oncall / 招聘 / 新入职 junior / 5 年后 CTO
- **investor** — 宏观策略 / 行业分析 / PM / 成长 VC / 做空激进派
- **career** — 20 年职业资本 mentor / 顶级 recruiter / 同辈干得好的 / 你的 CSO / 5 年后的你
- **product** — 真实 user / 竞品 PM / 写代码的内部 dev / Garry 风 / Naval 风
- **quant** — Jane Street MD / Citadel / Two Sigma ML / Anthropic / HFT 工程师

加 `custom` 完全自定义 voice 列表。

## 安装

```bash
npm install council-diff
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
console.log(result.agreement_score); // 0-1 — voices 同意程度
console.log(result.consensus);       // 1 段综合判断

for (const v of result.voices) {
  console.log(`${v.voice_display} (${v.score}/100): ${v.verdict}`);
  console.log(`  + ${v.strength}`);
  console.log(`  - ${v.gap}`);
}
```

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
    { slug: "cost_eng", display: "成本工程师", role_brief: "看账单的, 偏好 serverless 在规模上贵 5×" },
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
}
```

## 成本

每次 deliberation 一次 Claude Sonnet 4.6 调用,约 $0.02-0.04(看 context 长度)。

## Pattern 来源

- [Perplexity Model Council UI](https://www.perplexity.ai/hub/blog/perplexity-model-council)
- [Orallexa 多 agent 辩论](https://github.com/alex-jb/orallexa-ai-trading-agent)
- Cohere Command A+ 引用 pattern (来源以 `[src:...]` 形式内嵌)

## Brier 审核 (v0.2 新增)

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

详见 `src/brier.ts`。

## 路线图

- [x] Brier 审核数学 (v0.2)
- [ ] 公开 Brier 榜单 council.alex-jb.com
- [ ] 按 voice 流式输出供 UI
- [ ] Python 移植 (`pip install council-diff`)
- [ ] CLI: `council "我该不该辞职" --domain career`

## 许可

MIT
