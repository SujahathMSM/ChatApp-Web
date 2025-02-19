export const signUp = (req, res) => {
  const { fullName, email, password } = req.body;
  try {
  } catch (error) {
    console.log("An error occurred: " + error);
  }
  res.send("Signup route");
};
export const logIn = (req, res) => {
  res.send("LogIn route");
};
export const logOut = (req, res) => {
  res.send("LogOut route");
};
