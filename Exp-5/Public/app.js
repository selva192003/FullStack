(function() {
    'use strict';

    angular.module('todoApp', [])
        .controller('TodoController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
            $scope.todos = [];
            $scope.newTodoText = '';
            $scope.searchText = '';
            const API_URL = '/api/todos';

            // Function to load todos from the server
            $scope.loadTodos = function() {
                $http.get(API_URL)
                    .then(function(response) {
                        $scope.todos = response.data;
                        // Important: Initialize 'editing' property for existing todos
                        $scope.todos.forEach(todo => {
                            if (typeof todo.editing === 'undefined') {
                                todo.editing = false;
                            }
                        });
                    })
                    .catch(function(error) {
                        console.error('Error loading todos:', error);
                        alert('Failed to load todos.');
                    });
            };

            // Function to add a new todo
            $scope.addTodo = function() {
                if ($scope.newTodoText.trim() === '') {
                    alert('Task cannot be empty!');
                    return;
                }

                const newTodo = {
                    text: $scope.newTodoText.trim(),
                    completed: false,
                    editing: false // Ensure this is set for new todos
                };

                $http.post(API_URL, newTodo)
                    .then(function(response) {
                        $scope.todos.push(response.data);
                        $scope.newTodoText = '';
                    })
                    .catch(function(error) {
                        console.error('Error adding todo:', error);
                        alert('Failed to add task.');
                    });
            };

            // Function to toggle a todo's completed status
            $scope.toggleCompleted = function(todo) {
                $http.put(`${API_URL}/${todo.id}`, { completed: todo.completed })
                    .then(function(response) {
                        console.log('Todo completion status updated:', response.data);
                    })
                    .catch(function(error) {
                        console.error('Error toggling todo completion:', error);
                        todo.completed = !todo.completed; // Revert on error
                        alert('Failed to update task status.');
                    });
            };

            // Function to delete a todo
            $scope.deleteTodo = function(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    $http.delete(`${API_URL}/${id}`)
                        .then(function() {
                            $scope.todos = $scope.todos.filter(todo => todo.id !== id);
                        })
                        .catch(function(error) {
                            console.error('Error deleting todo:', error);
                            alert('Failed to delete task.');
                        });
                }
            };

            // New: Enter Edit Mode
            $scope.editTodo = function(todo) {
                $scope.todos.forEach(t => {
                    if (t !== todo) {
                        t.editing = false;
                    }
                });
                todo.editing = true;
                todo.originalText = todo.text;
            };

            // New: Save Edit (on blur or Enter key)
            $scope.saveEdit = function(todo) {
                todo.editing = false;

                if (todo.text.trim() === '') {
                    alert('Task text cannot be empty. Reverting to original.');
                    todo.text = todo.originalText;
                    return;
                }

                if (todo.text.trim() === todo.originalText.trim()) {
                    return;
                }

                $http.put(`${API_URL}/${todo.id}`, { text: todo.text.trim() })
                    .then(function(response) {
                        console.log('Todo text updated:', response.data);
                        todo.text = response.data.text;
                    })
                    .catch(function(error) {
                        console.error('Error updating todo text:', error);
                        alert('Failed to update task text. Reverting.');
                        todo.text = todo.originalText;
                    });
            };

            // CORRECTED: Clear All Completed Todos
            $scope.clearCompleted = function() {
                const completedTodos = $filter('filter')($scope.todos, { completed: true });
                if (completedTodos.length === 0) {
                    return;
                }

                if (confirm(`Are you sure you want to clear ${completedTodos.length} completed tasks?`)) {
                    const deletePromises = completedTodos.map(todo =>
                        $http.delete(`${API_URL}/${todo.id}`)
                    );

                    Promise.all(deletePromises)
                        .then(() => {
                            console.log('All completed todos successfully targeted for deletion.');
                        })
                        .catch(error => {
                            console.error('An error occurred during batch deletion:', error);
                            alert('Some tasks might not have been cleared. Please check.');
                        })
                        .finally(() => { // This is the key change!
                            // Always reload the list from the server to ensure consistency
                            $scope.loadTodos();
                        });
                }
            };

            // Load todos when the controller initializes
            $scope.loadTodos();
        }]);
})();