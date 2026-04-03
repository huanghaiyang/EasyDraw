import { createRouter, createWebHistory } from 'vue-router';
import BoardList from '../views/BoardList.vue';
import BoardEditor from '../views/BoardEditor.vue';

const routes = [
  {
    path: '/',
    name: 'BoardList',
    component: BoardList
  },
  {
    path: '/board/:id',
    name: 'BoardEditor',
    component: BoardEditor,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
