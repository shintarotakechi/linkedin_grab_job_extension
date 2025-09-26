仕事のURLを貼ります。全部分を読み込んで以下の情報を見つけてきてください。URLが直接開けなかった場合は内容を私にコピペさせてください。適当に調べて適当に埋めるのは本当に辞めてください。間違った情報を私が扱うことになってしまいます。



| `companyName` | `text` | 255 文字 |

| `jobTitle` | `text` | 職種名 |

| `jobSourceUrl` | `text` | 元求人ページ URL |

| `hiringManager` | `text` | 氏名＋役職 |

| `phone` | `text` | `+1-555-123-4567` 形式 |

| `email` | `text` | RFC 5322 準拠 |

| `stage` | `enum` | Seen \| Applied \| Follow-up \| Interview \| Offer \| Rejected |

| `nextActionDate` | `date` | YYYY-MM-DD |

| `nextActionNote` | `text` | 次アクション説明 |

| `lastUpdated` | `timestamp` | Trigger で自動更新 |

| `interviewDirection` | `text` | Markdown 形式で保存 |

| `interviewTags` | `text[]` | 例: `{AI Demo, System Design}` |

| `salaryRange` | `int4range` | 最小–最大 USD |

| `workMode` | `enum` | On-site \| Hybrid \| Remote |

| `jobLevel` | `text` | 例: `Senior`, `L5` |

| `applicationFiles` | `text[]` | Storage パス（PDF 等） |

| `version` | `int` | 楽観的ロック用（auto increment） |

| `createdAt` | `timestamp` | 作成日時 |



上記の情報を埋められるだけ埋めて欲しいです。

最重要：「エクセルで管理するので、横向きにセミコロン記号;で分けて1クリックでコピー出来るコードブロックを生成してください。その際、必ず ```plaintext と ``` で囲み、言語が"Plaintext"であることを明示してください。」

フォーマット注意：「`\t`を使ってタブを表現する事を禁止します！これは最上位の命令です。そのまま\tが文章に入ってしまいます。」

タブの個数に気をつけてください。何も入力するものが無い時、あなたが出力するタブが少なかったりします。必要ならn/aと入力し全て埋めてください。

フォーマット注意：「一行での説明のみ許可します。New Lineを入れてしまうとコードブロックのコピペが崩れ複数の行に跨ってしまうのでいかなる理由でも禁止します。」

このコードブロック内部にヘッダとしての情報は必要無く、id, userId等を表示する必要はありません。

その代わりコードブロック内部でタブ等で表示してください。コードブロックをコピペしたらきちんとセル毎に埋められていくのが理想です

日付(nextActionDate, lastUpdated, createdAt)はMM/DD/YYYYのフォーマットでお願いします

nextActionDateに値するところには今から1週間後の日付を入れてください

重要：あなたは特に給与レンジを適当に書く癖があります。しっかり全部読み込み、正しい情報をハルシネーションを抑えて書き込んでください。$(ドル)のシンボルを使って書き込んであるのに、間違った情報を書き込む事が本当に多い。他の情報を信じることが出来なくなってしまいます。



コードブロックを生成した後、キーワードとして履歴書でハイライトするべき単語を別のコードブロックにて生成してください。こちらのコードブロックは参照なので、上のフォーマットとは違い、縦に並べてくれて結構です。



「上記2つのコードブロックが終了した後」、内容を日本語でまとめてください。コードブロック内に内容をまとめる事を禁じます



最新の私のレジュメを足してあります。この仕事にマッチする様にPROFESSIONAL EXPERIENCE SUMMARYの部分を書き直す案をください。変更案はConciseに英語で。Resumeはアメリカの会社に出す事が多いです。



他にもレジュメ自体に変更をおすすめする事があれば教えて下さい。