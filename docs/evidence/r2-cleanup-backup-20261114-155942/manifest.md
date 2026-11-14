# R2 测试数据清理 — apply 记录

- 生成时间：2026-11-14T15:59:42.412Z
- 模式：apply（含 pending QA）
- bucket：`paid-tools-files`
- 备份目录：`docs\evidence\r2-cleanup-backup-20261114-155942`

## 删除清单（38 个对象，41.01 MB）

| key | bytes | reason |
|---|---|---|
| `headshot/out/2026-11-12/headshot_mwdjwl22_wt5wrf/headshot-01.jpg` | 190429 | 孤儿/历史 headshot/out 对象（jobId=headshot_mwdjwl22_wt5wrf，无真实订单关联）— --include-historical 指定删除 |
| `headshot/out/2026-11-14/headshot_mwg8uw70_9kwnsb/headshot-02.jpg` | 214006 | 测试订单关联输出（headshot/out，jobId=headshot_mwg8uw70_9kwnsb） |
| `headshot/out/2026-11-14/headshot_mwg993xt_yujet3/headshot-02.jpg` | 222279 | 测试订单关联输出（headshot/out，jobId=headshot_mwg993xt_yujet3） |
| `headshot/out/2026-11-14/headshot_mwg993xt_yujet3/headshot-03.jpg` | 193616 | 测试订单关联输出（headshot/out，jobId=headshot_mwg993xt_yujet3） |
| `headshot/out/2026-11-14/headshot_mwg993xt_yujet3/headshot-04.jpg` | 198549 | 测试订单关联输出（headshot/out，jobId=headshot_mwg993xt_yujet3） |
| `headshot/out/2026-11-14/headshot_mwg993xt_yujet3/headshot-05.jpg` | 250418 | 测试订单关联输出（headshot/out，jobId=headshot_mwg993xt_yujet3） |
| `jobs/headshot/headshot_mwdjwl22_wt5wrf.json` | 1326 | 孤儿/历史 job（kind=headshot, status=done，无真实订单关联）— --include-historical 指定删除 |
| `jobs/headshot/headshot_mwg8uw70_9kwnsb.json` | 7666 | 测试订单关联 job（kind=headshot, orderId=ord_mwg8u8c2_cscke5i, status=done） |
| `jobs/headshot/headshot_mwg993xt_yujet3.json` | 8238 | 测试订单关联 job（kind=headshot, orderId=ord_mwg98npc_21xbl9p, status=done） |
| `jobs/voice/voice_mwdjtvvw_bz9nv8.json` | 2197 | 孤儿/历史 job（kind=voice, status=done，无真实订单关联）— --include-historical 指定删除 |
| `jobs/voice/voice_mwgh7t7f_ndvth1.json` | 553 | 测试订单关联 job（kind=voice, orderId=ord_mwggroyd_1q2v4v3, status=failed） |
| `orders/headshot/ord_mwdjc0nd_j5a2v8g.json` | 641 | 历史测试订单（headshot，status=refunded, plan=headshot-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/headshot/ord_mwfye9w4_rsnl8uv.json` | 582 | 历史测试订单（headshot，status=pending, plan=headshot-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/headshot/ord_mwfz79kj_hj0wn4j.json` | 582 | 历史测试订单（headshot，status=pending, plan=headshot-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/headshot/ord_mwg8u8c2_cscke5i.json` | 336 | B 站 e2e 测试订单（headshot，手工标记 paid、无真实 Waffo payment） |
| `orders/headshot/ord_mwg95akh_eohr2pu.json` | 336 | B 站 e2e 测试订单（headshot，手工标记 paid、无真实 Waffo payment） |
| `orders/headshot/ord_mwg98npc_21xbl9p.json` | 336 | B 站 e2e 测试订单（headshot，手工标记 paid、无真实 Waffo payment） |
| `orders/headshot/ord_mwgaj564_dups35c.json` | 372 | B 站 e2e 测试订单（headshot，手工标记 paid、无真实 Waffo payment） |
| `orders/headshot/ord_mwghi8yg_8kvhp00.json` | 546 | pending QA checkout（headshot，status=pending，从未付款；--include-pending-qa 指定删除） |
| `orders/headshot/ord_mwgjqwpz_ly0e7ly.json` | 546 | 历史测试订单（headshot，status=pending, plan=headshot-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwdirvlc_ett3m1b.json` | 285 | 历史测试订单（voice，status=pending, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwdit6f3_mkgxa8d.json` | 587 | 历史测试订单（voice，status=paid, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwdjbmv8_ub3utqt.json` | 637 | 历史测试订单（voice，status=refunded, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwdk0mq6_3unopbu.json` | 728 | 历史测试订单（voice，status=refunded, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwfz8lsy_jwziwpe.json` | 578 | 历史测试订单（voice，status=pending, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwgasq3s_7ljnhv9.json` | 542 | 历史测试订单（voice，status=pending, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `orders/voice/ord_mwgfkkc3_6smw1w4.json` | 537 | pending QA checkout（voice，status=pending，从未付款；--include-pending-qa 指定删除） |
| `orders/voice/ord_mwgg5izz_g1066ru.json` | 537 | pending QA checkout（voice，status=pending，从未付款；--include-pending-qa 指定删除） |
| `orders/voice/ord_mwghhfc7_o9i5jz2.json` | 542 | pending QA checkout（voice，status=pending，从未付款；--include-pending-qa 指定删除） |
| `orders/voice/ord_mwgjqtee_lnd2ekf.json` | 542 | 历史测试订单（voice，status=pending, plan=voice-trial；无真实付款，非证据单）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjh8xh_ihmaq6/bass.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjh8xh_ihmaq6，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjh8xh_ihmaq6/drums.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjh8xh_ihmaq6，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjh8xh_ihmaq6/other.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjh8xh_ihmaq6，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjh8xh_ihmaq6/vocals.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjh8xh_ihmaq6，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjtvvw_bz9nv8/bass.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjtvvw_bz9nv8，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjtvvw_bz9nv8/drums.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjtvvw_bz9nv8，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjtvvw_bz9nv8/other.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjtvvw_bz9nv8，无真实订单关联）— --include-historical 指定删除 |
| `voice/out/2026-11-12/voice_mwdjtvvw_bz9nv8/vocals.mp3` | 5212996 | 孤儿/历史 voice/out 对象（jobId=voice_mwdjtvvw_bz9nv8，无真实订单关联）— --include-historical 指定删除 |

## 保留（真实/退款/B fanout E2E 证据，14 个对象）

- `headshot/out/2026-11-14/headshot_mwg9j392_k4cqqp/headshot-01.jpg` — 真实订单关联输出（headshot/out，jobId=headshot_mwg9j392_k4cqqp）
- `headshot/out/2026-11-14/headshot_mwg9j392_k4cqqp/headshot-02.jpg` — 真实订单关联输出（headshot/out，jobId=headshot_mwg9j392_k4cqqp）
- `headshot/out/2026-11-14/headshot_mwg9j392_k4cqqp/headshot-03.jpg` — 真实订单关联输出（headshot/out，jobId=headshot_mwg9j392_k4cqqp）
- `headshot/out/2026-11-14/headshot_mwg9j392_k4cqqp/headshot-04.jpg` — 真实订单关联输出（headshot/out，jobId=headshot_mwg9j392_k4cqqp）
- `headshot/out/2026-11-14/headshot_mwg9j392_k4cqqp/headshot-05.jpg` — 真实订单关联输出（headshot/out，jobId=headshot_mwg9j392_k4cqqp）
- `jobs/headshot/headshot_mwg9j392_k4cqqp.json` — 真实订单关联 job（orderId=ord_mwg9ivk0_dgk2bjw）
- `jobs/voice/voice_mwg0y8bj_11wiv9.json` — 真实订单关联 job（orderId=ord_mwfzkg8h_yy9s9md）
- `orders/headshot/ord_mwg9ivk0_dgk2bjw.json` — 真实/退款证据订单（headshot）— B fanout 真实 E2E 证据（Lead 2026-11-14 指定：job headshot_mwg9j392_k4cqqp + 5 张 headshot-0N.jpg）— 保留
- `orders/voice/ord_mwfzkg8h_yy9s9md.json` — 真实/退款证据订单（voice）— 真实付款 $2.90（Waffo live ORD_3FE3bBRlLEJaeliEA30nYS，已退款）— 退款证据，保留
- `orders/voice/ord_mwggroyd_1q2v4v3.json` — 真实/退款证据订单（voice）— 真实付款 $0.10 QA 单（已退款，REF_0KRhN70cseWHScS8fXld6D）— 退款证据，保留
- `voice/out/2026-11-14/voice_mwg0y8bj_11wiv9/bass.mp3` — 真实订单关联输出（voice/out，jobId=voice_mwg0y8bj_11wiv9）
- `voice/out/2026-11-14/voice_mwg0y8bj_11wiv9/drums.mp3` — 真实订单关联输出（voice/out，jobId=voice_mwg0y8bj_11wiv9）
- `voice/out/2026-11-14/voice_mwg0y8bj_11wiv9/other.mp3` — 真实订单关联输出（voice/out，jobId=voice_mwg0y8bj_11wiv9）
- `voice/out/2026-11-14/voice_mwg0y8bj_11wiv9/vocals.mp3` — 真实订单关联输出（voice/out，jobId=voice_mwg0y8bj_11wiv9）

## 待 Lead 决定（未删，0 个对象）


## 删除后验证

- 受保护订单仍可读：✅ 是
- 被删 key 已不存在：✅ 是
- 残留（应为 0）：0
- 错误：0

详细 JSON：`docs\evidence\r2-cleanup-backup-20261114-155942\manifest.json`
