<!DOCTYPE html>
<html>
<head>
    <title>Upload File</title>
    <link rel="stylesheet" href="/resources/dist/bundle.js">
</head>
<body>
<div class="container">
    <h2 class="mt-5">Upload File</h2>
    <form action="upload" method="post" enctype="multipart/form-data" class="mt-3">
        <div class="form-group">
            <label for="file">File</label>
            <input type="file" name="file" class="form-control" required/>
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <input type="text" name="description" class="form-control" placeholder="Description" required/>
        </div>
        <div class="form-group">
            <label for="category">Category</label>
            <select name="category" class="form-control" required>
                <option value="">Select Category</option>
                <c:forEach var="category" items="${categories}">
                    <option value="${category.name}">${category.name}</option>
                </c:forEach>
            </select>
        </div>
        <div class="form-group">
            <label for="subCategory">Sub Category</label>
            <select name="subCategory" class="form-control" required>
                <option value="">Select Sub Category</option>
                <c:forEach var="category" items="${categories}">
                    <c:forEach var="subCategory" items="${category.subCategories}">
                        <option value="${subCategory.name}">${subCategory.name}</option>
                    </c:forEach>
                </c:forEach>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Upload</button>
    </form>
    <p class="mt-3">${message}</p>
    <a href="/" class="btn btn-secondary mt-3">Back to Home</a>
</div>
</body>
</html>