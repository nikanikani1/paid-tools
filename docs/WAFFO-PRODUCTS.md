# Waffo 产品（2026-11-12 已创建）

> 商户：`MER_6iDqSRSror3CvBRoEb3t7E`；店铺：`STO_0PjvI9SX3zMUP176pCadMg`（tidycontracts 同商户，新产品独立）
> 方式：`POST /v1/actions/onetime-product/create-product` / `subscription-product/create-product`，RSA-SHA256 签名（脚本 `tools/waffo-create-all.mjs`，密钥不落仓库）
> 环境：live key 创建，产品状态 active。

## A 站 StemSplit

| 套餐 | 类型 | 价格 | Waffo Product ID |
|---|---|---|---|
| Trial Pack 15 分钟 | one-time | $2.90 | `PROD_6kSYbZsVjgzoc7vwXxh1ka` |
| Starter 90 分钟/月 | subscription monthly | $5.00 | `PROD_7LljPmOZhoIGRIr6KmJnT3` |
| Pro 200 分钟/月 | subscription monthly | $9.00 | `PROD_2yCeMGhkuK8Ty7i1iXvr0b` |
| Starter Annual 90 分钟/月 | subscription yearly | $39.00 | `PROD_3TvkLLt9IuHwRMVo3UG4Rj` |

## B 站 PortraitLab

| 套餐 | 类型 | 价格 | Waffo Product ID |
|---|---|---|---|
| Sample Pack 5 张 | one-time | $9.00 | `PROD_2T3kfOP3KloTX9xbnjjoTv` |
| Starter 40 张 | one-time | $35.00 | `PROD_6AvOkeWSLcnJmurxg1JVGI` |
| Professional 60 张 | one-time | $45.00 | `PROD_14Xr5V4f9yVDw7Q2LslauC` |
| Executive 100 张 | one-time | $75.00 | `PROD_2sr2Wxc7VKQUzrlWWdwsMe` |

## 已用测试 checkout 验证

- 用 Trial product 创建 checkout session 成功：
  `sessionId=cs_14692d85-50b0-da19-d01f-085cc23ef3a2`
  `checkoutUrl=https://pancake.waffo.ai/store/tidycontracts-qzvinaig/checkout/cs_...`
  `expiresAt=2026-11-13T05:08:00Z`
- 还差：把 product ID 接进代码（`/api/checkout` + webhook），并把 `successUrl` 从占位 `stemextractor.com` 换成正式域名。

## 环境变量（已写 `.env.local`，不提交）

```
WAFFO_PRODUCT_ID_VOICE_TRIAL=...
WAFFO_PRODUCT_ID_VOICE_STARTER=...
WAFFO_PRODUCT_ID_VOICE_PRO=...
WAFFO_PRODUCT_ID_VOICE_ANNUAL=...
WAFFO_PRODUCT_ID_HEADSHOT_TRIAL=...
WAFFO_PRODUCT_ID_HEADSHOT_40=...
WAFFO_PRODUCT_ID_HEADSHOT_60=...
WAFFO_PRODUCT_ID_HEADSHOT_100=...
```
