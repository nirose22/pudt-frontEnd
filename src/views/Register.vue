<template>
  <div class="max-w-md mx-auto mt-10 p-6 border rounded space-y-4">
    <h2 class="text-xl font-bold">註冊</h2>
    <input placeholder="Email" class="w-full p-2 border rounded" />
    <input type="password" placeholder="密碼" class="w-full p-2 border rounded" />
    <select class="w-full p-2 border rounded">
      <option disabled selected>請選擇角色</option>
      <option>使用者</option>
      <option>商家</option>
      <option>管理員</option>
    </select>
    <Button variant="default" size="lg">註冊</Button>
  </div>
</template>
