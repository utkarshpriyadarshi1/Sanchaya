<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="/resources/dist/bundle.js">
</head>
<body>
<div class="container">
    <h2 class="mt-5">Login</h2>
    <form action="authenticate" method="post" class="mt-3">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" name="username" class="form-control" placeholder="Username" required/>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" name="password" class="form-control" placeholder="Password" required/>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
    </form>
</div>
</body>
</html>