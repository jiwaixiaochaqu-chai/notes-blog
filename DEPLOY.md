# 博客部署指南（GitHub Pages + EdgeOne Pages 双平台）

> 目标：简历上放正式链接 `https://jiwaixiaochaqu-chai.github.io/notes-blog/`，
> 国内不挂梯子走 `https://notes-blog.edgeone.app`。
> 全程免费，不买域名、不备案。以后想升级自定义域名，两边各加一条解析即可。

## 前提

- 仓库已初始化并完成首次提交（本目录已是 git 仓库）。
- 站点已全面改为**相对路径**（2026-09-21 改造），可部署在任意子路径下，
  仓库名不再受限制；本站使用仓库名 `notes-blog`。
- **RAG 栏目已换成完整课件站**（2026-09-22）：课件源放在本目录 `courseware/`，
  构建时整体铺到 `dist/rag/`。以后更新课件：用新版课件替换 `courseware/`
  目录内容 → 跑 `scripts/build.ps1` → `git add -A && git commit -m "update courseware" && git push`。

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

## 第二步：部署到 EdgeOne Pages 国际版（国内可直连，约 10 分钟）

> 用的是**国际版 edgeone.ai**，不是国内腾讯云控制台。国内版 Makers 只给 3 小时临时预览域名，
> 国际版才给免费的永久子域名 `xxx.edgeone.app`。

1. 注册 / 登录（国内容易直连，不用梯子）
   - 注册：https://edgeone.ai/register
   - 登录：https://edgeone.ai/login
   - 推荐直接点 **Sign Up with Google**（用 Gmail 一键注册，省掉邮箱验证码）
   - 邮箱注册也可：邮箱 `jiwaixiaochaqu@gmail.com`，密码 `Jiwx#2026Blog`
     （密码若被占用提示过弱，改成 `Jiwx#2026Blog!` 之类即可）
2. 登录后进入控制台 https://console.edgeone.ai/ ，首次进入点 **Get Started / 立即开通**
3. `Bind GitHub` → 授权 → 选中仓库 `jiwaixiaochaqu-chai/notes-blog`
4. 构建配置（**构建环境是 Linux，务必用下面这行命令**，原来的 PowerShell 脚本在 Linux 上跑不了）：

   | 配置项 | 填写值 |
   | --- | --- |
   | Build Command | `node scripts/build.mjs` |
   | Output Directory | `dist` |
   | Node Version | 22（或默认） |
   | 加速区域 | 全球部署 |

5. 点 **Start Deployment**，约 1 分钟构建完成，系统分配默认域名
   （形如 `notes-blog-xxxx.edgeone.app`；若 `notes-blog.edgeone.app` 未被占用会直接用它）
6. 不挂梯子访问该域名验证。以后 push 到 main 会自动重新部署

> 仓库已带好跨平台构建脚本 `scripts/build.mjs`（2026-09-22 新增），
> 本地和 CI、EdgeOne 三处都用同一套构建逻辑；`scripts/build.ps1` 保留给 Windows 本地用。


> 说明：edgeone.app 是腾讯的免费子域名，绝大多数地区可直连，速度中等；
> 简历上仍建议放 GitHub Pages 地址，这个地址作为国内访问入口（或在简历上两个都放）。

---

## 日常更新流程

```powershell
# 1. 改完笔记后重新构建（Node 跨平台脚本，本地/CI/EdgeOne 通用）
node scripts/build.mjs
# Windows 上也可以用老脚本：
# powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/build.ps1

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
