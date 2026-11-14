# R2 测试数据清理（P1-7）— 已执行

> 工具：`tools/cleanup-test-data.mjs`（新，零业务代码改动，默认 dry-run，`--apply` 才写）
> 状态：**✅ APPLIED（2026-11-15 00:02 CST，Lead 2026-11-14 批准全量 A+B + 额外保护 B fanout E2E 证据）**
> 结果：删除 **38 个对象 / 41.01 MB**，保留 **14 个证据对象 / 1.15 MB**，未识别 6 个（events/*、smoke.txt）；删除 0 失败，`protectedReadable=true`、`deletedGone=true`、残留 0。
> 最后更新：2026-11-15 00:05（Asia/Shanghai）

## 1. 结果速览

| 指标 | 清理前 | 清理后 |
|---|---|---|
| R2 对象总数（bucket `paid-tools-files`） | 58 | **20** |
| 订单 JSON | 22 | **3**（全部为真实/退款/B fanout 证据） |
| job JSON | 7 | **2**（真实订单关联） |
| `voice/out` + `headshot/out` 对象 | 29 | **9**（真实订单 + B fanout 证据） |
| `events/*` + `smoke.txt`（不清理） | 6 | 6 |

本次删除 = 4 个 B 站 e2e 假 paid 订单 + 2 个其 job + 5 张输出 + 1 个 QA 失败 job + 4 个 pending QA checkout + 11 个历史测试订单 + 2 个孤儿 job + 9 个 11-12 E2E 遗留输出 = **38 个对象 / 41.01 MB**。

## 2. 保留（硬保护，14 个对象 / 1.15 MB）

| key/对象 | 原因 |
|---|---|
| `orders/voice/ord_mwfzkg8h_yy9s9md.json` | 真实付款 $2.90（Waffo live `ORD_3FE3bBRlLEJaeliEA30nYS`，已退款）— 退款证据 |
| `orders/voice/ord_mwggroyd_1q2v4v3.json` | 真实付款 $0.10 QA 单（已退款，`REF_0KRhN70cseWHScS8fXld6D`）— 退款证据 |
| `orders/headshot/ord_mwg9ivk0_dgk2bjw.json` | **B fanout 真实 E2E 证据**（Lead 指定保护） |
| `jobs/voice/voice_mwg0y8bj_11wiv9.json` | 真实订单 `ord_mwfzkg8h_yy9s9md` 关联 job |
| `voice/out/2026-11-14/voice_mwg0y8bj_11wiv9/{vocals,drums,bass,other}.mp3` | 真实订单输出（7 天签名 URL 的源对象） |
| `jobs/headshot/headshot_mwg9j392_k4cqqp.json` | B fanout E2E job（status=done，5/5 成功） |
| `headshot/out/2026-11-14/headshot_mwg9j392_k4cqqp/headshot-01..05.jpg` | B fanout E2E 的 5 张输出（Lead 指定保护） |
| `events/*`（6 个）、`smoke.txt` | 非清理目标，归入 unknown，永不删 |

> 复核（2026-11-15 00:04 CST，独立脚本）：3 个受保护订单 + 2 个保护 job 全部 `HeadObject` 存在且 ContentLength 正常；剩余 20 对象的分布 3 orders / 2 jobs / 9 out / 6 events+smoke。

## 3. 识别规则（工具内硬编码，可审计）

### 自动删除（`--apply` 才执行）

| 类别 | 数量 | 内容 / 原因 |
|---|---|---|
| `e2e_test_order` | 4 | `ord_mwg8u8c2_cscke5i`、`ord_mwg95akh_eohr2pu`、`ord_mwg98npc_21xbl9p`、`ord_mwgaj564_dups35c` — B 站 e2e 手工标记 paid、**无真实 Waffo payment** |
| `test_job` | 2 | `headshot_mwg8uw70_9kwnsb`（cscke5i）、`headshot_mwg993xt_yujet3`（21xbl9p） |
| `test_output` | 5 | 上述 2 个 job 的 `headshot-0N.jpg`（1+4） |
| `qa_refunded_job` | 1 | `voice_mwgh7t7f_ndvth1` — QA 已退款单的失败 job（Replicate 502，无输出；订单 JSON 保留） |

### 本次经 Lead 批准一并删除（默认工具只列出，需 flag）

| 类别 / flag | 数量 | 内容 |
|---|---|---|
| `pending_qa`（`--include-pending-qa`） | 4 | `ord_mwgfkkc3_6smw1w4`、`ord_mwgg5izz_g1066ru`、`ord_mwghhfc7_o9i5jz2`、`ord_mwghi8yg_8kvhp00` — 均 status=pending、无 email、从未付款 |
| `historical_order`（`--include-historical`） | 11 | 11-12～11-13 E2E 测试单（`ord_mwdit6f3_mkgxa8d` paid、`ord_mwdjbmv8_ub3utqt`/`ord_mwdk0mq6_3unopbu`/`ord_mwdjc0nd_j5a2v8g` refunded 等，其余 pending）— 均无真实 Waffo payment |
| `orphan_job` / `orphan_output` | 2 job + 9 对象 | `voice_mwdjh8xh_ihmaq6`、`voice_mwdjtvvw_bz9nv8` 各 4 个 4.97MB stem；`headshot_mwdjwl22_wt5wrf` 1 张（11-12 E2E 遗留） |

> 注：`ord_mwg9ivk0_dgk2bjw`（原 e2e 列表第 4 单）经 Lead 指定从删除改为保护，工具里已移入 `PROTECTED_ORDERS`；其 job `headshot_mwg9j392_k4cqqp` 与 5 张输出通过 `job.input.orderId` 关联自动保护。

## 4. 用法

```bash
# 1) dry-run（默认，只读；只会打印清单）
node tools/cleanup-test-data.mjs

# 2) dry-run + 写计划 JSON 到 docs/evidence/
node tools/cleanup-test-data.mjs --write-plan

# 3) 机器可读输出（CI/Lead 汇总用）
node tools/cleanup-test-data.mjs --json

# 4) 只删已批准类别（4 个 B 站 e2e 测试单 + 其 job/out + QA 已退款单 job）
node tools/cleanup-test-data.mjs --apply

# 5) 连同 pending QA checkout 一起删
node tools/cleanup-test-data.mjs --apply --include-pending-qa

# 6) 全量清理（本次实际执行命令；仍保留全部证据对象）
node tools/cleanup-test-data.mjs --apply --include-pending-qa --include-historical
```

可选参数：`--env-file <path>`（默认 `.env.local`）、`--bucket <name>`、`--out <manifest path>`、`--dry-run`。

### apply 时工具做什么

1. 先写备份到 `docs/evidence/r2-cleanup-backup-<UTC时间戳>/`：
   - `manifest.json`：删除清单（key/大小/原因/分类）、受保护对象快照、订单摘要（不含明文 email）
   - `orders/<site>__<orderId>.json`：所有被删订单的完整 JSON 备份（本次 19 个）
   - `manifest.md`：人读版（含删除前后验证结果）
2. `DeleteObjects` 批量删除（1000/批），记录 `Deleted`/`Errors`
3. 删除后验证：
   - 受保护订单 `HeadObject` 仍存在、内容可读 → `protectedReadable`
   - 被删 key 再次 `HEAD` + 全量 `ListObjectsV2` 复查 → `deletedGone`（残留必须为 0）
   - 任何失败 → 退出码 1

### 安全边界

- 默认 dry-run；没有 `--apply` 不会调用任何写 API。
- 未识别 key 一律不删。
- 真实/退款证据 + B fanout 证据订单及其关联 job/输出在代码里是硬保护（`PROTECTED_ORDERS`），即使误加 `--include-*` 也不会删。
- `events/*` 与 `smoke.txt` 保留。
- 不改业务代码、不 commit、不 deploy。

## 5. 本次 apply 证据

| 项 | 路径 |
|---|---|
| 执行命令 | `node tools/cleanup-test-data.mjs --apply --include-pending-qa --include-historical` |
| 备份目录 | `docs/evidence/r2-cleanup-backup-20261114-155942/` |
| 机器清单（含订单摘要 + 删除结果 + 验证） | `docs/evidence/r2-cleanup-backup-20261114-155942/manifest.json` |
| 人读报告 | `docs/evidence/r2-cleanup-backup-20261114-155942/manifest.md` |
| 被删订单 JSON 备份（19 个） | `docs/evidence/r2-cleanup-backup-20261114-155942/orders/` |
| 清理前 dry-run 计划 | `docs/evidence/r2-cleanup-plan-20261114-155331.json` |

验证输出（工具）：

```
[cleanup] 删除完成: 38 成功 / 0 失败
受保护订单仍可读: OK
被删 key 已不存在: OK（残留 0）
删除错误: 0
剩余对象: 20
```

## 6. 回滚

- 订单 JSON 有完整备份（`docs/evidence/r2-cleanup-backup-20261114-155942/orders/*.json`），可用 S3 `PutObject` 写回 `orders/<site>/<id>.json`。
- `voice/out`、`headshot/out` 产物未下载二进制、无法从备份恢复；但本次删除对象全部为测试数据，无真实用户交付物；需要时可重新生成。
- 真实订单与 B fanout 证据共 14 个对象未受影响（已 HEAD 复核）。

## 7. 遗留 / 后续

- [x] Lead 确认删除范围（全量 A+B：45 类对象，其中 7 个 B fanout 证据转保护 → 实际删 38）
- [x] 执行 `--apply`，manifest 路径已补进本文档
- [x] 删除后验证（protectedReadable / deletedGone / 剩余 20 对象）
- [ ] R2 lifecycle（`voice-out-30d`、`headshot-out-30d`）本次未改动，建议顺带复核仍 Enabled
- [ ] 未 commit / 未 deploy（按任务要求）
