# VIP 相关接口文档

> 所有接口均需登录（携带 Token），Headers: `Authorization: Bearer {token}`
>
> **VIP 功能开关说明**：所有接口响应中均包含 `vipEnabled` 字段。当 `vipEnabled = false` 时，表示 VIP 功能未开放，前端可展示「VIP暂未开放」提示。

---

## 1. 获取用户总充值和 VIP 等级信息

> 用于旧版 VIP 等级展示（基于 `tt_vip_level` 表配置）

- **路径**：`GET /api/user/vipLevelInfo`
- **请求参数**：无

**响应示例**：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "totalRecharge": 500.00,
    "vipEnabled": true,
    "vipLevelList": [
      {
        "id": 1,
        "name": "VIP1",
        "icon": "http://xxx.com/vip1.png",
        "rechargeThreshold": 100.00,
        "commissions": 5.00,
        "addedBonus": 10.00,
        "description": "充值满100元升级VIP1"
      }
    ]
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| totalRecharge | BigDecimal | 用户累计总充值金额 |
| vipEnabled | Boolean | VIP功能是否开启 |
| vipLevelList | Array | VIP等级配置列表 |
| vipLevelList[].id | Integer | 等级ID |
| vipLevelList[].name | String | VIP等级名称 |
| vipLevelList[].icon | String | VIP等级图标URL |
| vipLevelList[].rechargeThreshold | BigDecimal | 达标所需充值金额 |
| vipLevelList[].commissions | BigDecimal | 充值加送比例（%） |
| vipLevelList[].addedBonus | BigDecimal | 达标奖励红包金额 |
| vipLevelList[].description | String | 等级描述 |

---

## 2. 获取每日福利信息

> 展示用户当前 VIP 等级、今日/昨日消费、消费返点信息（基于 `tt_vip_config` 表配置）

- **路径**：`GET /api/user/dailyBenefits`
- **请求参数**：无

**响应示例（VIP 已开启）**：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "vipEnabled": true,
    "vipLevel": 2,
    "vipLevelName": "VIP2",
    "todayConsumeAmount": 120.00,
    "yesterdayConsumeAmount": 80.00,
    "rebateRate": 2.50,
    "rebateAmount": 3.00,
    "activityRule": "用户每消费1元，可获得0.0250元（2.50%）的奖励"
  }
}
```

**响应示例（VIP 未开启）**：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "vipEnabled": false,
    "vipLevel": 0,
    "vipLevelName": "普通用户",
    "todayConsumeAmount": 0,
    "yesterdayConsumeAmount": 0,
    "rebateRate": 0,
    "rebateAmount": 0,
    "activityRule": "VIP功能暂未开放"
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| vipEnabled | Boolean | VIP功能是否开启 |
| vipLevel | Integer | 当前VIP等级（0=普通用户） |
| vipLevelName | String | 当前VIP等级名称 |
| todayConsumeAmount | BigDecimal | 今日消费金额 |
| yesterdayConsumeAmount | BigDecimal | 昨日消费金额 |
| rebateRate | BigDecimal | 消费返点比例（%） |
| rebateAmount | BigDecimal | 今日已获得返点金额 |
| activityRule | String | 活动规则描述文本 |

---

## 3. 获取 VIP 进程信息

> 展示用户 VIP 升级进度、距下一等级所需金额、所有等级列表

- **路径**：`GET /api/user/vipProgress`
- **请求参数**：无

**响应示例（VIP 已开启）**：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "vipEnabled": true,
    "currentLevel": 1,
    "currentLevelName": "VIP1",
    "totalConsume": 200.00,
    "nextLevel": 2,
    "nextLevelName": "VIP2",
    "nextLevelRequire": 500.00,
    "progress": 40.00,
    "allVipLevels": [
      {
        "level": 1,
        "name": "VIP1",
        "growthValue": 100.00,
        "rebateRate": 1.00,
        "achieved": true
      },
      {
        "level": 2,
        "name": "VIP2",
        "growthValue": 500.00,
        "rebateRate": 2.50,
        "achieved": false
      }
    ]
  }
}
```

**响应示例（VIP 未开启）**：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "vipEnabled": false,
    "currentLevel": 0,
    "currentLevelName": "普通用户",
    "totalConsume": 0,
    "nextLevel": null,
    "nextLevelName": "",
    "nextLevelRequire": 0,
    "progress": 0,
    "allVipLevels": []
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| vipEnabled | Boolean | VIP功能是否开启 |
| currentLevel | Integer | 当前VIP等级 |
| currentLevelName | String | 当前VIP等级名称 |
| totalConsume | BigDecimal | 有效累计充值金额（仅统计起始时间之后的充值） |
| nextLevel | Integer | 下一VIP等级，已满级时为 null |
| nextLevelName | String | 下一VIP等级名称 |
| nextLevelRequire | BigDecimal | 升至下一等级所需总充值金额 |
| progress | BigDecimal | 当前升级进度百分比（0~100） |
| allVipLevels | Array | 所有VIP等级配置列表 |
| allVipLevels[].level | Integer | VIP等级数字 |
| allVipLevels[].name | String | VIP等级名称 |
| allVipLevels[].growthValue | BigDecimal | 达成所需充值金额 |
| allVipLevels[].rebateRate | BigDecimal | 消费返点比例（%） |
| allVipLevels[].achieved | Boolean | 用户是否已达成该等级 |

---

## 4. 获取消费返点奖励记录

> 查询用户历史消费返点发放记录（已发放的，最近50条）

- **路径**：`GET /api/user/rewardList`
- **请求参数**：无

**响应示例**：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 101,
      "recordDate": "2026-04-16 00:00:00",
      "consumeAmount": 200.00,
      "rebateAmount": 5.00,
      "isDistributed": 1,
      "distributeTime": "2026-04-17 00:05:00",
      "vipLevel": 2
    }
  ]
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 记录ID |
| recordDate | Date | 消费日期（记录日期） |
| consumeAmount | BigDecimal | 当日消费金额 |
| rebateAmount | BigDecimal | 返点金额 |
| isDistributed | Integer | 是否已发放（1=已发放） |
| distributeTime | Date | 实际发放时间 |
| vipLevel | Integer | 发放时的VIP等级 |

---

## 补充说明

### VIP 等级升级逻辑
- VIP 等级由用户**累计充值金额**决定（对比 `tt_vip_config.growthValue`）
- 系统支持设置**统计起始时间**（`sys_config` 中 `vip.growth.startDate`），只计算起始时间之后的充值
- 充值成功后自动触发 VIP 等级升级检查

### 消费返点发放逻辑
- 每日消费产生返点，次日凌晨定时任务统一发放到用户余额
- 返点比例由用户当前 VIP 等级对应的 `rebateRate` 决定

### VIP 功能开关
- 通过 `sys_config` 表中 `config_key = 'vip.enabled'` 控制
- `1` = 开启，`0` 或记录不存在 = 关闭
- 关闭时所有接口仍正常返回，但 `vipEnabled = false`，不执行升级/返点逻辑
