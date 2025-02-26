<!DOCTYPE html>
<html>
<head>
    <title>Create User</title>
    <link rel="stylesheet" href="/resources/dist/bundle.js">
</head>
<body>
<div class="container">
    <h2 class="mt-5">Create User</h2>
    <form action="createUser" method="post" class="mt-3">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" name="username" class="form-control" placeholder="Username" required/>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" name="password" class="form-control" placeholder="Password" required/>
        </div>
        <div class="form-group">
            <label for="role">Role</label>
            <select name="role" class="form-control" required>
                <option value="">Select Role</option>
                <c:forEach var="role" items="${roles}">
                    <option value="${role.id}">${role.name}</option>
                </c:forEach>
            </select>
        </div>
        <button type="submit" class="btn btn-primary mt-3">Create</button>
    </form>
    <p class="mt-3">${message}</p>
    <a href="/admin/dashboard" class="btn btn-secondary mt-3">Back to Dashboard</a>
</div>
</body>
</html>