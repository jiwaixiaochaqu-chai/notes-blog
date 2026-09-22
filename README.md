# Guides 学习笔记库

这是一个静态学习笔记站点，用来存放 RAG、Agent、机器学习、深度学习、NLP 和项目实战笔记。

## 当前内容

- RAG 知识库：来自 `D:\hm\my\zhengshi\10.rag\笔记.md`
- 投满分项目：来自 `D:\hm\my\zhengshi\8.send_full_score\笔记\投满分\文本分类项目.md`
- 机器学习 / 深度学习 / NLP：来自 `D:\hm\my\zhengshi\总结.md`

## 使用

先同步源文档并构建，再启动本地服务：

```powershell
npm run build
python -m http.server 5173 --directory dist
```

然后访问 `http://localhost:5173`。

`npm run build` 会重新读取上面的三份源文档，复制新增图片并更新目录。完整 RAG
课件保留在 `/courseware/`，最新 RAG 笔记位于 `/rag/`。

## 后续添加 Agent 笔记

把新的 Markdown 放入 `content/`，再在 `src/guides.json` 增加一条记录即可出现在左侧 Guides 列表中。
