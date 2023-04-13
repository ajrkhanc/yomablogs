var User = require('../app/models/user');
var Post = require('../app/models/post');
var Tag = require('../app/models/tag');
var Category = require('../app/models/category');
var Feedback = require('../app/models/feedback');

module.exports = function (express) {
    var app = express.Router();
    app.get('/', function (req, res) {
        if (req.cookies.decoded._doc.Role == "admin") {
            User.find({}, function (err, users) {
                res.render('ControlPanel', { user: req.cookies.decoded._doc, users: users });
            });
        }
        else {
            //TODO : Don't Allow Normal Users to see other users accounts
            res.render('ControlPanel', { user: req.cookies.decoded._doc });
        }
    });

    app.get('/users/edit', function (req, res) {
        Category.find({}, function (err, cats) {
            res.render('edituser', { user: req.cookies.decoded._doc, cats: cats, isAdmin: (req.cookies.decoded._doc.Role == 'admin' ? true : false) });
        });
    });


    app.post('/users/edit', function (req, res) {
        User.findOne({ email: req.cookies.decoded._doc.email }).select('email password name bio Role ImageURL username Social').exec(function (err, user) {
            if (err) res.status(400).json({ message: 'user not found' });
            var pas = user.password;
            user.password = req.body.password || req.cookies.decoded._doc.password;
            if (user.password == null) {
                user.password = pas;
            }
            user.name = req.body.name || req.cookies.decoded._doc.name;
            user.username = req.body.username || req.cookies.decoded._doc.username;
            user.bio = req.body.bio || req.cookies.decoded._doc.bio;
            user.email = req.body.email || req.cookies.decoded._doc.email;
            user.Role = req.cookies.decoded._doc.Role;
            user.imageURL = req.body.ImageURL || req.cookies.decoded._doc.ImageURL;
            user.Social = {
                FaceBook: req.body.facebook || '',
                Twitter: req.body.twitter || '',
                WebSite: req.body.website || '',
                LinkedIn: req.body.linkedin || '',
                YouTube: req.body.youtube || ''
            };
            console.log(user);
            user.save(function (err) {
                if (err) {
                    res.status(400).json({ message: 'Wrong thing' + err });
                }
                delete user.password;
                console.log(user);
                res.cookie('decoded', { _doc: user }, { httpOnly: true });
                return res.redirect('./profile');
            });
        });
    });

    app.get('/posts', function (req, res) {
        if ((req.cookies.decoded._doc.Role == "admin")
            || (req.cookies.decoded._doc.Role == "user")) {
            if (req.cookies.decoded._doc.username == "ajrkhan") {
                var perPage = 20
                var page = req.query.page || 1

                Post
                    .find({})
                    .sort({ _id: -1 })
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .exec(function (err, posts) {
                        Post.count().exec(function (err, count) {
                            if (err) return next(err)
                            res.render('manageposts', {
                                posts: posts,
                                current: page,
                                pages: Math.ceil(count / perPage),
                                user: req.cookies.decoded._doc
                            })
                        })
                    })
            } else {
                var perPage = 20
                var page = req.query.page || 1

                Post
                    .find({ Author: req.cookies.decoded._doc.username })
                    .sort({ _id: -1 })
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .exec(function (err, posts) {
                        Post.count().exec(function (err, count) {
                            if (err) return next(err)
                            res.render('manageposts', {
                                posts: posts,
                                current: page,
                                pages: Math.ceil(count / perPage),
                                user: req.cookies.decoded._doc
                            })
                        })
                    })
            }
        } else {
            Post.find({}, function (err, posts) {
                if (err) { console.log(err) }
                posts = posts.reverse();
                return res.render('manageposts', { posts: posts, user: req.cookies.decoded._doc });
            });
        }
    });


    // get all feedback for admin to manage
    app.get('/manage-feedback', function (req, res) {
        Feedback.find({}, function (err, feedback) {
            if (err) { console.log(err) }
            feedback = feedback.reverse();
            return res.render('managefeedback', { feedback: feedback, user: req.cookies.decoded._doc});
        });
    })

    // posts feedback
    app.post('/posts/feedback/:posturl', function (req, res) {
        Post.findOne({ url: req.body.posturl }, function (err, post) {
            if (err) { console.log(err) }
            var feedback = new Feedback({
                user: req.cookies.decoded._doc.username,
                post: req.body.posturl,
                comment: req.body.feedback,
                PublishDate: new Date().toLocaleDateString(),

            });
            feedback.save(function (err) {
                if (err) { console.log(err) }
                return res.redirect('/posts/' + req.body.posturl);
            });
        });
    });

    app.route('/posts/new')
        .get(function (req, res) {
            Category.find({}, function (err, cats) {
                if (err) console.log(err);
                return res.render('newPost', { user: req.cookies.decoded._doc, cats: cats });
            });

        })
        .post(function (req, res) {
            var reqTitle = req.body.title.replace(/[^a-zA-Z0-9 ]/g, "");
            reqTitle = reqTitle.toLowerCase();
            var posturl = reqTitle.split(' ').join('-')
            // check if post with same url already exists
            Post.findOne({ posturl: posturl }, function (err, post) {
                if (post) {
                    posturl = posturl + '-' + Date.now();
                    console.log('do this')
                    var tags = tagsToArray(req.body.tags);
                    var post = new Post({
                        Title: req.body.title,
                        Content: req.body.content,
                        Description: req.body.description,
                        category: req.body.category,
                        tags: tags,
                        ImageURL: req.body.image,
                        ImageAlt: req.body.imagealt,
                        Author: req.cookies.decoded._doc.username,
                        AuthorFullname: req.cookies.decoded._doc.name,
                        posturl: posturl,
                        PublishDate: new Date().toLocaleDateString(),
                        ModifiedDate: new Date().toLocaleDateString(),
                        isPublished: '1'
                    });
                    post.save(function (err) {
                        if (err) throw err;
                        return res.redirect('/controlpanel/posts');
                    });
                } else {
                    var tags = tagsToArray(req.body.tags);
                    var post = new Post({
                        Title: req.body.title,
                        Content: req.body.content,
                        Description: req.body.description,
                        category: req.body.category,
                        tags: tags,
                        ImageURL: req.body.image,
                        ImageAlt: req.body.imagealt,
                        Author: req.cookies.decoded._doc.username,
                        AuthorFullname: req.cookies.decoded._doc.name,
                        posturl: posturl,
                        PublishDate: new Date().toLocaleDateString(),
                        ModifiedDate: new Date().toLocaleDateString(),
                        isPublished: '1'
                    });
                    post.save(function (err) {
                        if (err) throw err;
                        return res.redirect('/controlpanel/posts');
                    });
                }
            });
        });

    // unpublish
    app.get('/posts/unpublish/:posturl', function (req, res) {
        Post.findOne({ posturl: req.params.posturl }, function (err, post) {
            if (err) { console.log(err) }
            post.isPublished = '0';
            post.save(function (err) {
                if (err) { console.log(err) }
                return res.redirect('/controlpanel/posts');
            });
        });
    });

    // publish
    app.get('/posts/publish/:posturl', function (req, res) {
        Post.findOne({ posturl: req.params.posturl }, function (err, post) {
            if (err) { console.log(err) }
            post.isPublished = '1';
            post.save(function (err) {
                if (err) { console.log(err) }
                return res.redirect('/controlpanel/posts');
            });
        });
    });



    // unpublish feedback
    app.get('/feedback/unpublish/:id', function (req, res) {
        Feedback.findOne({ _id: req.params.id }, function (err, feedback) {
            if (err) { console.log(err) }
            feedback.status = '0';
            feedback.save(function (err) {
                if (err) { console.log(err) }
                return res.redirect('/controlpanel/manage-feedback');
            });
        });
    });

    // publish feedback
    app.get('/feedback/publish/:id', function (req, res) {
        Feedback.findOne({ _id: req.params.id }, function (err, feedback) {
            if (err) { console.log(err) }
            feedback.status = '1';
            feedback.save(function (err) {
                if (err) { console.log(err) }
                return res.redirect('/controlpanel/manage-feedback');
            });
        });
    });

    app.route('/posts/edit/:id')
        .get(function (req, res) {
            Category.find({}, function (err, cats) {
                Post.findOne({ _id: req.params.id }, function (err, post) {
                    if (err) throw err;
                    return res.render('editPost', { user: req.cookies.decoded._doc, cats: cats, post: post });
                });
            });

        })
        .post(function (req, res) {
            var tags = tagsToArray(req.body.tags);
            var reqTitle = req.body.title.replace(/[^a-zA-Z0-9 ]/g, "");
            reqTitle = reqTitle.toLowerCase();
            var posturl = reqTitle.split(' ').join('-')
            // check if post with same url already exists in some other post
            Post.findOne({ posturl: req.body.posturl }, function (err, post) {
                if (err) { console.log(err) }
                if (post && post.Title == req.body.title) {
                    // posturl = posturl + '-' + Date.now();
                    // console.log('do this')
                    Post.findOneAndUpdate({ _id: req.body.hiddenid }, {
                        $set: {
                            Title: req.body.title,
                            Content: req.body.content,
                            Description: req.body.description,
                            category: req.body.category,
                            tags: tags,
                            ImageURL: req.body.image,
                            ImageAlt: req.body.imagealt,
                            posturl: post.posturl,
                            ModifiedDate: req.body.ModifiedDate,
                            isPublished: '1'
                        }
                    }, function (err, newPost) {
                        if (err) throw err;
                        console.log(newPost);
                        return res.redirect('/controlpanel/posts');
                    });
                } else if(post && post.Title != req.body.title){
                    posturl = posturl + '-' + Date.now();
                    console.log('do this')
                    Post.findOneAndUpdate({ _id: req.body.hiddenid }, {
                        $set: {
                            Title: req.body.title,
                            Content: req.body.content,
                            Description: req.body.description,
                            category: req.body.category,
                            tags: tags,
                            ImageURL: req.body.image,
                            ImageAlt: req.body.imagealt,
                            posturl: posturl,
                            ModifiedDate: req.body.ModifiedDate,
                            isPublished: '1'
                        }
                    }, function (err, newPost) {
                        if (err) throw err;
                        console.log(newPost);
                        return res.redirect('/controlpanel/posts');
                    });
                } else{
                    Post.findOneAndUpdate({ _id: req.body.hiddenid }, {
                        $set: {
                            Title: req.body.title,
                            Content: req.body.content,
                            Description: req.body.description,
                            category: req.body.category,
                            tags: tags,
                            ImageURL: req.body.image,
                            ImageAlt: req.body.imagealt,
                            posturl: posturl,
                            ModifiedDate: req.body.ModifiedDate,
                            isPublished: '1'
                        }
                    }, function (err, newPost) {
                        if (err) throw err;
                        console.log(newPost);
                        return res.redirect('/controlpanel/posts');
                    });
                }
            }
            );
        }
        );
        
        app.get('/posts/delete/:id', function (req, res) {
            Post.findOneAndRemove({ _id: req.params.id }, function (err) {
                if (err) throw err;
                return res.redirect('/controlpanel/posts');
            });
        });


    app.get('/tags', function (req, res) {
        Tag.find({}, function (err, tags) {
            if (err) throw err;
            return res.render('tagsAdmin', { tags: tags, user: req.cookies.decoded._doc });
        });
    });
    app.get('/categories', function (req, res) {
        Category.find({}, function (err, cats) {
            return res.render('adminCategories', { cats: cats, user: req.cookies.decoded._doc });
        });

    });
    app.route('/categories/new')
        .get(function (req, res) {
            res.render('newCategory', { user: req.cookies.decoded._doc, edit: false });
        })
        .post(function (req, res) {
            var category = new Category({
                Name: req.body.name.toLowerCase(),
                Caturl: req.body.name.toLowerCase().split(' ').join('-')
            });
            category.save(function (err) {
                if (err) { console.log(err); }
                return res.redirect('./');
            });
        });

    app.route('/categories/edit/:name')
        .get(function (req, res) {
            res.render('newCategory', { user: req.cookies.decoded._doc, edit: true, cat: req.params.name });
        })
        .post(function (req, res) {
            Category.findOneAndUpdate({ Name: req.body.oldname }, { $set: { Name: req.body.name, Caturl: req.body.name.toLowerCase().split(' ').join('-') } }, function (err) {
                if (err) throw err;
                Post.find({ category: req.body.oldname }, function (err, posts) {
                    for (post of posts) {
                        post.category = req.body.name;
                        post.save();
                    }
                });
                return res.redirect('/controlpanel/categories');
            });
        });

    app.get('/categories/delete/:name', function (req, res) {
        Category.findOneAndRemove({ Name: req.params.name }, function (err) {
            if (err) throw err;
            return res.redirect('/controlpanel/categories');
        });
    });

    app.use(function (req, res, next) {
        if (req.cookies.decoded._doc.Role != "admin") {
            return res.redirect('/controlpanel');
        }
        next();
    });

    app.get('/users', function (req, res) {
        User.find({}, function (err, users) {
            if (err) throw err;
            return res.render('usersAdmin', { users: users, user: req.cookies.decoded._doc });
        });
    });

    app.get('/users/edit/:username', function (req, res) {
        Category.find({}, function (err, cats) {
            User.findOne({ username: req.params.username }, function (err, user) {
                res.render('edituser', { user: user, cats: cats, isAdmin: (req.cookies.decoded._doc.Role == 'admin' ? true : false) });
            });
        });
    });


    app.post('/users/edit/:username', function (req, res) {
        User.findOne({ username: req.params.username }).select('email password name bio Role ImageURL username Social').exec(function (err, user) {
            if (err) res.status(400).json({ message: 'user not found' });
            var pas = user.password;
            user.password = req.body.password || req.cookies.decoded._doc.password;
            if (user.password == null) {
                user.password = pas;
            }
            user.name = req.body.name || req.cookies.decoded._doc.name;
            user.username = req.body.username || req.cookies.decoded._doc.username;
            user.bio = req.body.bio || req.cookies.decoded._doc.bio;
            user.Role = req.body.Role || req.cookies.decoded._doc.Role;
            user.imageURL = req.body.ImageURL || req.cookies.decoded._doc.ImageURL;
            user.Social = {
                FaceBook: req.body.facebook || '',
                Twitter: req.body.twitter || '',
                WebSite: req.body.website || '',
                LinkedIn: req.body.linkedin || '',
                YouTube: req.body.youtube || ''
            };
            user.save(function (err) {
                if (err) {
                    res.status(400).json({ message: 'Wrong thing' + err });
                }
                return res.redirect('/profile');
            });
        });
    });

    return app;
};


function tagsToArray(tagsInString) {
    var tags = tagsInString.split(',');
    var tagsjson = [];
    for (t of tags) {
        tagsjson.push(t.trim().toLowerCase());
    }
    return tagsjson;
}

function saveTag(tagName) {
    console.log(tagName);
    Tag.findOneAndUpdate({ Name: tagName }, function (err, tagn) {
        console.log('dfdfdfdfdfdf');
        if (err) throw err;
        console.log(tagn);
    });
}

function toTitleCase(words) {
    return words.split(' ').map(
        function (s) {
            return s[0].toUpperCase() + s.substring(1).toLowerCase()
        }).join(' ');
}