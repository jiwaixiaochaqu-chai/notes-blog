# 博客部署指南（GitHub Pages + EdgeOne Pages 双平台）

> 目标：简历上放正式链接 `https://jiwaixiaochaqu-chai.github.io/notes-blog/`，
> GitHub Pages：`https://jiwaixiaochaqu-chai.github.io/notes-blog/`。
> EdgeOne 国际站：`https://notes-blog.edgeone.dev`。该默认域名在中国大陆会返回 401；
> 若要长期稳定、免梯子访问，需要给 EdgeOne 项目绑定自定义域名。

## 前提

- 仓库已初始化并完成首次提交（本目录已是 git 仓库）。
- 站点已全面改为**相对路径**（2026-09-21 改造），可部署在任意子路径下，
  仓库名不再受限制；本站使用仓库名 `notes-blog`。
- `/rag/` 在构建时从 `D:\hm\my\zhengshi\10.rag\笔记.md` 同步最新笔记；完整课件站
  独立保留在 `/courseware/`。更新任一源文档后运行 `npm run build`。

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

## 第二步：部署到 EdgeOne Makers 国际版

> 当前国际站项目 ID 为 `makers-ynucpxxh5bxc`，生产地址为
> `https://notes-blog.edgeone.dev`。默认域名不面向中国大陆公开访问。

1. 注册 / 登录（国内容易直连，不用梯子）
   - 注册：https://edgeone.ai/register
   - 登录：https://edgeone.ai/login
   - 可使用 Google 或邮箱注册；不要在仓库中记录账号密码
2. 登录后进入控制台 https://console.edgeone.ai/ ，首次进入点 **Get Started / 立即开通**
3. `Bind GitHub` → 授权 → 选中仓库 `jiwaixiaochaqu-chai/notes-blog`
4. 构建配置（**构建环境是 Linux，务必用下面这行命令**，原来的 PowerShell 脚本在 Linux 上跑不了）：

   | 配置项 | 填写值 |
   | --- | --- |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Node Version | 22（或默认） |
   | 加速区域 | 全球部署 |

5. 点 **Start Deployment**，等待构建完成并验证生产地址
6. 要提供中国大陆长期访问，在项目的域名设置中绑定自己可管理 DNS 的域名

> 仓库已带好跨平台构建脚本 `scripts/build.mjs`（2026-09-22 新增），
> 本地和 CI、EdgeOne 三处都用同一套构建逻辑；`scripts/build.ps1` 保留给 Windows 本地用。


> 说明：中国大陆区域的系统预览链接只有约 3 小时有效；国际站默认域名在大陆返回 401。
> 自定义域名是 EdgeOne 官方给出的长期访问方案，上线后仍应分别用移动、联通、电信实测。

---

## 日常更新流程

```powershell
# 1. 改完笔记后重新构建（Node 跨平台脚本，本地/CI/EdgeOne 通用）
npm run build
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
