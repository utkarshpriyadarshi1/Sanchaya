<!DOCTYPE html>
<html>
<head>
    <title>Create Category</title>
</head>
<body>
<h2>Create Category and Sub Category</h2>
<form action="createCategory" method="post">
    <input type="text" name="categoryName" placeholder="Category Name" required/>
    <input type="text" name="subCategoryName" placeholder="Sub Category Name" required/>
    <button type="submit">Create</button>
</form>
<p>${message}</p>
<a href="/admin/dashboard">Back to Dashboard</a>
</body>
</html>