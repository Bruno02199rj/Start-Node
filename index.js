const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
var mongoose = require('mongoose');
var session = require('express-session')


const app = express();

const Posts = require('./Posts.js');
;



mongoose.connect('mongodb+srv://root:pwToB2b4dsAikjqZ@cluster0.fmf1cmw.mongodb.net/Node?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('conectado')
}).catch((err)=>{
    console.log(err.message)
    
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

app.get('/',(req,res)=>{
    
    if(req.query.busca == null){
        Posts.find({}).sort({'_id':-1}).exec((err,posts)=>{
            //console.log(posts[0])
            posts = posts.map((val)=>{
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substring(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })

            Posts.find({}).sort({'views':-1}).limit(3).exec((err,postsTop)=>{
                //console.log(posts[0])
                postsTop = postsTop.map((val)=>{
                    return{
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substring(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
            
            
            
                res.render('home',{posts:posts, postsTop:postsTop});
        })
        })

    }else{
        Posts.find({titulo: {$regex: req.query.busca,$options:'i'}},(err,posts)=>{
            console.log(req.query)
            res.render('busca',{posts:posts,contagem:posts.length});
        })
    }

})



app.get('/:slug',(req,res)=>{
       
       Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views : 1}}, {new: true},(err, resposta)=>{
        if(resposta != null){
            
            Posts.find({}).sort({'views':-1}).limit(3).exec((err,postsTop)=>{
                //console.log(posts[0])
                postsTop = postsTop.map((val)=>{
                    return{
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substring(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
   
        res.render('single',{noticia:resposta,postsTop:postsTop}); 
       })

        }else{
            res.redirect('/');
        }
    })
})

var  usuarios = [
    {
        login: "Bruno",
        senha: '123456'
    }
];

app.post('/admin/login', (req,res)=>{
   usuarios.map((val)=>{
    if(val.login == req.body.login && val.senha == req.body.senha){
        req.session.login = "Bruno";
       
    }

   })

   res.redirect('/admin/login');
})

app.post('/admin/cadastro', (req,res)=>{
    //inserir no banco de dados
    Posts.create({
        titulo: req.body.titulo_noticia,
        imagem: req.body.url_image,
        categoria: req.body.categoria,
        conteudo: req.body.noticia,
        slug: req.body.slug,
        autor: "Admin",
        views: 0
    });

    res.send('cadastrado com sucesso ');
    console.log(req.body)

})

app.get('/admin/deletar/:id', (req,res)=>{
    Posts.deleteOne({_id:req.params.id}).then(()=>{
        res.redirect('/admin/login');
       
    });
})

app.get('/admin/login',(req,res)=>{
    if(req.session.login == null){
      
       res.render('admin-login');
   
    }else{
        Posts.find({}).sort({'views':-1}).limit(3).exec((err,posts)=>{
            //console.log(posts[0])
            posts = posts.map((val)=>{
                return{
                    id: val._id,
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substring(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
            })
        
        
        
            res.render('admin-painel', {posts:posts});
    })
           
    }
   
})

app.listen(3000,()=>{
    console.log('rodando')
})