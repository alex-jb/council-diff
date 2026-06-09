# 小红书

**标题**: 我开源了一个 AI 议会 · 5 个专家辩论你的决策

**封面文字**: 5 voice AI council ⚖️

**正文**:

单个 LLM 给的"90% 自信"和 5 个专家分歧的"60% 自信",信号完全不同。

我用这个观察做了 council-diff —— 开源的 5 voice AI 议会。

粘进决策,5 个专家并行评判:

🚀 创业者议会
YC Partner / VC 怀疑者 / 律师 / Indie CFO / 务实配偶

🛠 工程师议会
Rust 核心 / SRE oncall / 招聘 / 新入职 junior / 5 年后 CTO

📈 投资者议会
宏观策略 / 行业分析 / PM / 成长 VC / 做空激进派

🎯 职业议会
20 年 mentor / 顶级 recruiter / 同辈 / 你的 CSO / 5 年后的你

📱 产品议会
真实 user / 竞品 PM / 内部 dev / Garry 风 / Naval 风

📊 量化议会
Jane Street / Citadel / Two Sigma / Anthropic / HFT

每个专家给 0-100 分 + 1 段判词 + 最强支持 + 最大风险。

最后综合 1 段 + agreement_score(分歧度)+ 建议 (go / wait / kill / split)。

一次 Sonnet 4.6 调用,约 ¥0.2。

线上: vibexforge.com/council
源码: github.com/alex-jb/council-diff
双语 README (中文 + EN)

#开源 #AI #Claude #创业 #编程 #决策 #量化 #求职
