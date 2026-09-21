# 博客部署指南（GitHub Pages + EdgeOne Pages 双平台）

> 目标：简历上放正式链接 `https://jiwaixiaochaqu-chai.github.io/notes-blog/`，
> 国内不挂梯子走 `https://notes-blog.edgeone.app`。
> 全程免费，不买域名、不备案。以后想升级自定义域名，两边各加一条解析即可。

## 前提

- 仓库已初始化并完成首次提交（本目录已是 git 仓库）。
- 站点已全面改为**相对路径**（2026-09-21 改造），可部署在任意子路径下，
  仓库名不再受限制；本站使用仓库名 `notes-blog`。

---

## 第一步：部署到 GitHub Pages（约 10 分钟）

> 已替你完成：分支已改名为 main，远端 origin 已指向
> `https://github.com/jiwaixiaochaqu-chai/notes-blog.git`，提交已就绪。

1. 登录 GitHub，打开 https://github.com/new
   - Repository name 填：`notes-blog`
   - 选 Public → 点 `Create repository`（不要勾选任何初始化文件）
2. 回到本地，在本目录打开你自己的 PowerShell（不是本对话的终端），执行：

   ```powershell
   git push -u origin main
   ```

   首次 push 会弹出 GitHub 登录窗口，用浏览器授权即可。
   （如果推送报网络错误，先开梯子再推一次）

4. 打开仓库页面 → `Settings` → 左侧 `Pages`：
   - Source 选择 **GitHub Actions**
5. 进入仓库 `Actions` 标签页，等待 "Deploy to GitHub Pages" 工作流跑完（绿色 ✓）
6. 访问 `https://jiwaixiaochaqu-chai.github.io/notes-blog/` 验证

> 仓库里已带好 `.github/workflows/deploy.yml`，每次 `git push` 都会自动重新部署。

---

## 第二步：部署到 EdgeOne Pages（国内可直连，约 10 分钟）

1. 打开 EdgeOne Pages 控制台：https://console.cloud.tencent.com/edgeone/pages
   （没有腾讯云账号就注册一个，微信扫码即可，个人免费版够用）
2. `创建项目` → 选择 **从 GitHub 导入**（推荐，以后 push 自动更新）
   - 授权 GitHub，选中你的 `notes-blog` 仓库
   - **项目名称填 `notes-blog`**（决定最终网址）
   - 构建配置：框架选"无/静态"，构建输出目录填 `dist`
   - 如果不想连 GitHub，也可以选"直接上传"，把本地 `dist` 文件夹拖进去
3. 部署完成后得到：`https://notes-blog.edgeone.app` —— 国内直连可访问
   （若提示该子域名已被占用，换个名字即可，其余不变）
4. 用不挂梯子的浏览器/手机流量访问验证一下

> 说明：edgeone.app 是腾讯的免费子域名，绝大多数地区可直连，速度中等；
> 简历上仍建议放 GitHub Pages 地址，这个地址作为国内访问入口（或在简历上两个都放）。

---

## 日常更新流程

```powershell
# 1. 改完笔记后重新构建
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/build.ps1

# 2. 提交并推送（GitHub Pages 和 EdgeOne 会同时自动更新）
git add -A
git commit -m "update notes"
git push
```

---

## 常见问题

- **GitHub Pages 打不开/404**：检查 Actions 是否跑成功；确认访问地址带上了仓库名
  （`https://jiwaixiaochaqu-chai.github.io/notes-blog/`）。
- **push 提示认证失败**：Windows 下运行 `git config --global credential.helper manager`，
  再 push 会重新弹登录窗口。
- **以后想加自定义域名**：
  - GitHub：仓库 Settings → Pages → Custom domain 填域名，域名商加一条 CNAME 到 `<用户名>.github.io`
  - EdgeOne：项目设置 → 自定义域名，按提示加 CNAME
  - 国内访问要快就要备案后用国内 CDN，那是后话。
