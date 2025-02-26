<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="/resources/dist/bundle.js">
</head>
<body>
<div class="container">
    <h2 class="mt-5">Admin Dashboard</h2>

    <h3 class="mt-4">Last 10 Files Uploaded</h3>
    <ul class="list-group mt-3">
        <c:forEach var="file" items="${files}">
            <li class="list-group-item">${file.fileName} (${file.fileType}, ${file.fileSize} bytes, ${file.uploadDate})</li>
        </c:forEach>
    </ul>

    <h3 class="mt-4">Management</h3>
    <ul class="list-group mt-3">
        <li class="list-group-item"><a href="/admin/createCategory" class="btn btn-link">Create Category</a></li>
        <li class="list-group-item"><a href="/admin/modifyCategory" class="btn btn-link">Modify Category</a></li>
        <li class="list-group-item"><a href="/admin/createUser" class="btn btn-link">Create User</a></li>
    </ul>

    <h3 class="mt-4">Users and Roles</h3>
    <h4 class="mt-3">Users</h4>
    <ul class="list-group mt-3">
        <c:forEach var="user" items="${users}">
            <li class="list-group-item">${user.username} - <c:forEach var="role" items="${user.roles}">${role.name} </c:forEach></li>
        </c:forEach>
    </ul>

    <h4 class="mt-4">Roles</h4>
    <ul class="list-group mt-3">
        <c:forEach var="role" items="${roles}">
            <li class="list-group-item">${role.name}</li>
        </c:forEach>
    </ul>

    <h3 class="mt-4">Create Role</h3>
    <form action="createRole" method="post" class="mt-3">
        <div class="form-group">
            <label for="roleName">Role Name</label>
            <input type="text" name="roleName" class="form-control" placeholder="Role Name" required/>
        </div>
        <button type="submit" class="btn btn-primary mt-3">Create</button>
    </form>

    <h3 class="mt-4">Search Files</h3>
    <form action="search" method="post" class="mt-3">
        <div class="form-group">
            <label for="query">Query</label>
            <input type="text" name="query" class="form-control" placeholder="Search files..." />
        </div>
        <div class="form-group">
            <label for="fileType">File Type</label>
            <select name="fileType" class="form-control">
                <option value="">File Type</option>
                <option value="text/plain">Text</option>
                <option value="application/pdf">PDF</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <!-- Add more file types as needed -->
            </select>
        </div>
        <div class="form-group">
            <label for="role">User Role</label>
            <select name="role" class="form-control">
                <option value="">User Role</option>
                <option value="public">Public</option>
                <option value="clerk">Clerk</option>
                <option value="staff">Staff</option>
                <option value="assistant">Assistant</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
            </select>
        </div>
        <div class="form-group">
            <label for="dateFrom">Date From</label>
            <input type="date" name="dateFrom" class="form-control" placeholder="Date From" />
        </div>
        <div class="form-group">
            <label for="dateTo">Date To</label>
            <input type="date" name="dateTo" class="form-control" placeholder="Date To" />
        </div>
        <div class="form-group">
            <label for="category">Category</label>
            <input type="text" name="category" class="form-control" placeholder="Category" />
        </div>
        <div class="form-group">
            <label for="subCategory">Sub Category</label>
            <input type="text" name="subCategory" class="form-control" placeholder="Sub Category" />
        </div>
        <button type="submit" class="btn btn-primary mt-3">Search</button>
    </form>
</div>
</body>
</html>