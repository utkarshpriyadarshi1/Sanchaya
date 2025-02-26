<!DOCTYPE html>
<html>
<head>
    <title>Modify Category</title>
</head>
<body>
<h2>Modify Category and Sub Category</h2>
<form action="modifyCategory" method="post">
    <input type="number" name="categoryId" placeholder="Category ID" required/>
    <input type="text" name="newCategoryName" placeholder="New Category Name" required/>
    <input type="text" name="newSubCategoryName" placeholder="New Sub Category Name" required/>
    <button type="submit">Modify</button>
</form>
<p>${message}</p>
<a href="/admin/dashboard">Back to Dashboard</a>
</body>
</html>