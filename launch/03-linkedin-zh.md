# LinkedIn — 中文

我开源了一个自己用的工具:**council-diff**——给任何决策的 5 voice AI 议会。

单个 LLM 的"90% 自信"和 5 个专家的分歧,信号完全不同。Council-diff 把分歧暴露出来。

粘进去决策,5 个专家并行评判:

🚀 创业者议会: YC Partner / VC 怀疑者 / 律师 / Indie CFO / 务实配偶
🛠 工程师议会: Rust 核心 / SRE oncall / 招聘 / 入职 junior / 5 年后 CTO
📈 投资者议会: 宏观 / 行业 / PM / 成长 VC / 做空激进派
🎯 职业议会: 20 年 mentor / Recruiter / 同辈 / 你的 CSO / 5 年后的你
📱 产品议会: 真实 user / 竞品 PM / 内部 dev / Garry 风 / Naval 风
📊 量化议会: Jane Street / Citadel / Two Sigma / Anthropic / HFT

加 `custom` 完全自定义 voice 列表。

每个 voice 评 0-100,写出 1-2 句 verdict,指出最强支持 + 最大风险。最后综合 1 段 + `agreement_score`(分歧程度)+ 建议(go / wait / kill / split)。

一次 Claude Sonnet 4.6 调用,约 $0.03。

Pattern 来源: Perplexity Model Council UI + 我 Orallexa 量化交易里已经在跑的 5-voice debate 栈。Brier 审核在路线图里——追踪哪些建议实际兑现,公开榜单。

线上版: vibexforge.com/council
源码: github.com/alex-jb/council-diff
MIT,双语 README (EN + 中文)

你想先跑哪个决策?评论里贴一条,我用 council 跑出来回你。
