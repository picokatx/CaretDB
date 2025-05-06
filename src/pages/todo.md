
login
logout
The given code gave very generic error message when account is not found. It could be error due to wrong username, or wrong password. Make relevant changes such that a more specific error message is given to user, allowing them to know if the username is invalid, or password is invalid.
Add relevant jinja2 code in base.html such that the Login function will toggle to Logout icon and text after login (see 2). 
Similarly, after user clicks Logout, the icon and text will be toggled back to Login. 
register (must contain some basic validation code)
Add relevant code to the function profile() in app.py such that user can only access this page after login. 
Add relevant code in profile.html such that the profile information will be displayed when user clicks on this page. 
store hashed password in database
move matrix upload file to dashbaord
if a url parameter file with a string value is not passed to /matrix route, the route should instead display an option to c




delete account
remember me checkbox
admin
database should only be accessible to admin users


delete various things on cascade and whatever, add constraints checks 
make ddl not AI generated.
pad out dashboard and analysis a bit more


- [x] Mutation,
- [x] Input,
- [x] Selection,
- [x] MouseMove,
- [x] MouseInteraction,
- [x] Scroll,
- [x] TouchMove,
- [x] Drag,
- [x] MediaInteraction,
- [ ] Font,
- [x] ViewportResize, -- need way to resize window
- [ ] StyleSheetRule,
- [ ] StyleDeclaration,
- [ ] AdoptedStyleSheet,
