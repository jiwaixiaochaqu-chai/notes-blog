# Guides 学习笔记库

这是一个本地静态学习笔记站点，用来存放 RAG、Agent、机器学习、深度学习、NLP 和项目实战笔记。

## 当前内容

- RAG 知识库：来自 `D:\hm\my\zhengshi\10.rag\笔记.md`
- 投满分项目：来自 `D:\hm\my\zhengshi\8.send_full_score\笔记\投满分\投满分项目.md`
- 机器学习 / 深度学习 / NLP：来自 `D:\hm\my\zhengshi\总结.md`

## 使用

推荐在本目录启动一个本地服务：

```powershell
python -m http.server 5173
```

然后访问 `http://localhost:5173`。

## 后续添加 Agent 笔记

把新的 Markdown 放入 `content/`，再在 `src/guides.json` 增加一条记录即可出现在左侧 Guides 列表中。
