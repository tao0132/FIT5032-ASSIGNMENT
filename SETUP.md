# FIT5032 NFP Wellness - Setup Guide

## 环境变量配置

### SendGrid API密钥设置

为了使用邮件功能，你需要配置SendGrid API密钥：

#### 方法1：本地开发（使用环境变量）
在项目根目录创建 `.env` 文件：
```
SENDGRID_API_KEY=your_actual_sendgrid_api_key
```

#### 方法2：Firebase Functions（生产环境）
使用Firebase CLI设置环境配置：
```bash
firebase functions:config:set sendgrid.api_key="YOUR_ACTUAL_API_KEY"
```

查看当前配置：
```bash
firebase functions:config:get
```

## 重要提醒

⚠️ **永远不要将真实的API密钥提交到Git仓库！**

- API密钥应该保存在环境变量中
- `.env` 文件已被添加到 `.gitignore`
- 如果不小心提交了密钥，请立即在SendGrid中重新生成新的密钥

## 获取SendGrid API密钥

1. 访问 [SendGrid Dashboard](https://app.sendgrid.com/)
2. 进入 Settings → API Keys
3. 点击 "Create API Key"
4. 选择 "Full Access" 或 "Mail Send" 权限
5. 复制生成的密钥（只会显示一次！）

## 安装依赖

```bash
# 安装项目依赖
npm install

# 安装Firebase Functions依赖
cd functions
npm install
cd ..
```

## 运行项目

```bash
# 启动开发服务器
npm run dev
```

## 部署Firebase Functions

```bash
# 部署所有functions
firebase deploy --only functions

# 部署特定function
firebase deploy --only functions:sendWelcomeEmail
```

