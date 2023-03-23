const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const request = require('request')
const cors = require('@koa/cors')
const router = new Router()
const app = new Koa({proxy: true})

app.use(bodyParser())
app.use(cors())

const aiRouter = new Router({ // 设置前缀
    prefix: '/ai'
})
aiRouter.post('/chat', async (ctx, next) => {
    console.log(ctx.request.body)
    const {message} = ctx.request.body;
    let result = await new Promise((resolve, reject) => request(
        {
            uri: 'https://api.openai.com/v1/chat/completions',
            proxy: 'http://localhost:6666',
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                "temperature": 0.7
            }
        }
        , (err, res, body) => {
            resolve(body);
        }));
    if (result.choices) {
        ctx.body = {
            code: 0,
            data: result.choices[0].message.content
        }
    } else if (result.error) {
        ctx.body = {
            code: 0,
            msg: '出错啦',
            data: result.error.message
        }
    } else {
        ctx.body = {
            code: 0,
            data: 'ai请求错误'
        }
    }
})
app.use(aiRouter.routes());
app.use(router.allowedMethods())
app.listen(3000, () => {
    console.log('应用已经启动，http://localhost:3000')
})
