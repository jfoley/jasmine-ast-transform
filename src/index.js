import _ from 'lodash';

export default function ({ Plugin, types: t }) {
  var tests = [];

  return new Plugin("jasmine-ast-transform", {
    visitor: {
      ImportDeclaration(node, parent, scope, file) {
        if (node.specifiers.length && node.source.value === 'ember-qunit') {
          node.source.value = 'ember-cli-jasmine';
          var module;

          for (var specifier of (node.specifiers: Array)) {
            var name = specifier.imported.name;
            if(name === 'moduleForModel') {
              module = 'InjectModelHelpers';
            } else if(name === 'moduleForComponent') {
              module = 'InjectComponentHelpers';
            } else if(name === 'module') {
              module = 'InjectHelpers';
            } else if(name === 'moduleFor') {
              module = 'InjectHelpers';
            }
          }
          node.specifiers = [t.ImportSpecifier(
            t.Identifier(module),
            t.Identifier(module)
          )];
        }

        return node;
      },

      // your visitor methods go here
      MemberExpression: function(node, parent, scope, file) {
        if(t.isIdentifier(node.object, {name: 'assert'})) {
          if(t.isIdentifier(node.property, {name: 'ok'})) {
            return this.parentPath.replaceWith(
                t.MemberExpression(
                    t.CallExpression(
                        t.identifier('expect'), parent.arguments
                    ),
                    t.CallExpression(t.identifier('toBeDefined'))
                )
            );
          }

          if(t.isIdentifier(node.property, {name: 'equal'})) {
            return this.parentPath.replaceWith(
              t.MemberExpression(
                t.CallExpression(
                  t.identifier('expect'), [parent.arguments[0]]
                ),
                t.CallExpression(t.identifier('toEqual'), [parent.arguments[1]])
              )
            );
          }

          if(t.isIdentifier(node.property, {name: 'deepEqual'})) {
            return this.parentPath.replaceWith(
              t.MemberExpression(
                t.CallExpression(
                  t.identifier('expect'), [parent.arguments[0]]
                ),
                t.CallExpression(t.identifier('toEqual'), [parent.arguments[1]])
              )
            );
          }
        }
      },

      CallExpression: function(node, parent) {
        if(t.isIdentifier(node.callee, { name: "test" })) {
          var testBody = node.arguments[1];
          testBody.params.length = 0;

          var testNode = t.CallExpression(t.identifier('it'), node.arguments);
          tests.push(testNode);

          return testNode;
        }
      },

      Program: {
        exit(_node, _parent, scope, file) {
          var bodyPaths = this.get('body');

          let itPaths = _.filter(bodyPaths, (path) => {
            //return t.isExpressionStatement(path.node, {callee: 'it'});
            let expression = path.node.expression;
            return expression && expression.callee.name === 'it';
          });

          let itNodes = _.map(itPaths, (path) => path.node);

          _.each(bodyPaths, (path) => {
            if(!t.isExpressionStatement(path)) {
              return;
            }

            var helperFunction;
            var unitName;

            let name = path.node.expression.callee.name;

            if(name === 'moduleForModel') {
              helperFunction = 'InjectModelHelpers';
              unitName = path.node.expression.arguments[0];
            } else if(name === 'moduleForComponent') {
              helperFunction = 'InjectComponentHelpers';
              unitName = path.node.expression.arguments[0];
            } else if(name === 'moduleFor') {
              helperFunction = 'InjectHelpers';
              unitName = path.node.expression.arguments[0];
            } else if(name === 'module') {
              helperFunction = 'InjectHelpers';
              unitName = path.node.expression.arguments[0];
            }

            if(unitName) {
              var helperNode = t.CallExpression(
                t.Identifier(helperFunction), [unitName]
              );

              path.replaceWith(
                t.CallExpression(
                  t.identifier('describe'), [unitName, t.FunctionExpression(null, [],
                    t.blockStatement(
                      [helperNode, ...itNodes]
                    )
                  )]
                )
              );
            }
          });

          _.map(itPaths, (path) => path.dangerouslyRemove());

          //describeNode = _.find(bodyPaths, (path) => {
          //  //return t.isExpressionStatement(path.node, {callee: 'it'});
          //  let expression = path.node.expression;
          //  return expression && expression.callee.name === 'describe';
          //});

          //debugger
          //bodyPaths.forEach((nodePath) => {
          //  var node = nodePath.node;
          //
          //  if(t.isExpressionStatement(node) && node.expression.callee.name == 'it') {
          //    itNodes.push(node);
          //    nodePath.dangerouslyRemove();
          //  }
          //
          //  if(t.isExpressionStatement(node) && node.expression.callee.name == 'module') {
          //    debugger;
          //    moduleNode = nodePath;
          //    helperNode = t.callExpression(t.identifier('InjectHelpers'), [t.identifier('this')]);
          //  }
          //
          //  if(t.isExpressionStatement(node) && node.expression.callee.name == 'moduleFor') {
          //    moduleNode = nodePath;
          //    helperNode = t.callExpression(t.identifier('InjectHelpers'), [t.identifier('this')])
          //  }
          //
          //  if(t.isExpressionStatement(node) && node.expression.callee.name == 'moduleForModel') {
          //    debugger;
          //    describeNode.node.arguments[0]
          //    moduleNode = nodePath;
          //
          //    helperNode = t.callExpression(t.identifier('InjectModelHelpers'), [t.identifier(describeNode.node.arguments[0])])
          //  }
          //
          //  if(t.isExpressionStatement(node) && node.expression.callee.name == 'moduleForComponent') {
          //    moduleNode = nodePath;
          //    helperNode = t.callExpression(t.identifier('InjectComponentHelpers'), [t.identifier('this')])
          //  }
          //});
          //
          //var description = moduleNode.node.expression.arguments[0];
          //moduleNode.replaceWith(
          //  t.CallExpression(
          //    t.identifier('describe'), [description, t.FunctionExpression(null, [],
          //      t.blockStatement(
          //        [helperNode, ...itNodes]
          //      )
          //    )]
          //  )
          //);

        }
      }
    }
  });
}
