<!DOCTYPE html>
<html>
<head>
    <title>User Dashboard</title>
</head>
<body>
<h2>User Dashboard</h2>
<h3>Last 10 Files Uploaded by You</h3>
<ul>
    <c:forEach var="file" items="${files}">
        <li>${file.fileName} (${file.fileType}, ${file.fileSize} bytes, ${file.uploadDate})</li>
    </c:forEach>
</ul>

<h3>Search Files</h3>
<form action="search" method="post">
    <input type="text" name="query" placeholder="Search files..." />
    <select name="fileType">
        <option value="">File Type</option>
        <option value="text/plain">Text</option>
        <option value="application/pdf">PDF</option>
        <option value="image/jpeg">JPEG</option>
        <option value="image/png">PNG</option>
        <!-- Add more file types as needed -->
    </select>
    <select name="role">
        <option value="">User Role</option>
        <option value="public">Public</option>
        <option value="clerk">Clerk</option>
        <option value="staff">Staff</option>
        <option value="assistant">Assistant</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
    </select>
    <input type="date" name="dateFrom" placeholder="Date From" />
    <input type="date" name="dateTo" placeholder="Date To" />
    <input type="text" name="category" placeholder="Category" />
    <input type="text" name="subCategory" placeholder="Sub Category" />
    <button type="submit">Search</button>
</form>
</body>
</html>