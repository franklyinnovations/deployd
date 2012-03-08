// Testing Dependencies

expect = require('chai').expect
dpd = require('../')
root = {key: 'foo', secret: 'bar'}
server = dpd.use('http://localhost:3003')
client = require('mdoq').use('http://localhost:3003').use(function (req, res, next) {
  req.headers['x-dssh-key'] = root.key;
  next();
}).use(require('../lib/client'));
resources = client.use('/resources')
keys = dpd.use('/keys');
types = client.use('/types')
users = client.use('/users')
todos = client.use('/todos')
sessions = client.use('/sessions')
UserCollection = require('../lib/types').UserCollection
data = {
  resources: {
    todos: {
      type: 'Collection',
      path: '/todos',
      settings: {
        title: {
          description: "the title of the todo",
          type: "string",
          required: true
        },
        completed: {
          description: "the state of the todo",
          type: "boolean",
          default: false
        }
      }
    },
    users: {
      type: 'UserCollection',
      path: UserCollection.defaultPath,
      settings: UserCollection.settings
    }
  },
  users: [{email: 'foo@bar.com', password: 'foobar'}],
  todos: [{title: 'feed the dog', complete: false}, {title: 'wash the car', complete: false}, {title: 'finish some stuff', complete: false}]
}

clear = function(done) {
  todos.del(function (e) {
    sessions.del(function (err) {
      resources.del(function (error) {
        done()
      })
    })
  })
};

before(function(done){
  // remove old key
  keys.del(function () {
    // authorize root key
    dpd.use('/keys').post(root, function (err) {
      done(err)
    })
  })
})

beforeEach(function(done){
  server.listen(function () {
    clear(function () {
      resources.post(data.resources.todos, function (e) {
        resources.post(data.resources.users, function (err) {
          done(err || e);
        })
      })
    })
  });
})

afterEach(function(done){
  clear(function () {
    server.close()
    done()
  })
})
