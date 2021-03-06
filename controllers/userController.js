import routes from "../routes";
import Video from "../models/Video";
import User from "../models/User";
import passport from "passport";
import Image from "../models/Image";

//집
export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ _id: -1 })
      .populate("imageFileUrls")
      .populate("creator");
    const images = await Image.find({});
    //어차피 홈에있는 동영상빼고 아이디에 할당된 이미지만넣어
    //주말에 꼭 해야된다 이세끼야
    res.render("home", {
      pageTitle: "Home",
      videos,
      images,
    });
  } catch (error) {
    console.log(error);
    res.render("home", { pageTitle: "Home", videos: [] });
  }
};

//로그인
export const getLogin = (req, res) => res.render("login");

export const postLogin = passport.authenticate("local", {
  successRedirect: routes.home,
  failureRedirect: routes.join,
});

//깃허브로그인

export const githubLogin = passport.authenticate("github");

export const naverLogin = passport.authenticate("naver");

export const naverCallback = async (_, __, profile, done) => {
  const {
    _json: { email, nickname, profile_image, id },
  } = profile;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      user.naverId = id;
      user.save();
      done(null, user);
    } else {
      const newUser = await User.findOne({
        email,
        name: nickname || "nothing",
        avatarUrl: profile_image,
      });
      return done(null, newUser);
    }
  } catch (error) {
    done(error);
  }
};

export const githubCallback = async (_, __, profile, cb) => {
  const {
    _json: { id, avatar_url, name, email },
  } = profile;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      user.githubId = id;
      user.save();
      return cb(null, user);
    } else {
      const newUser = await User.create({
        email,
        name,
        avatarUrl: avatar_url,
      });
      return cb(null, newUser);
    }
  } catch (error) {
    cb(error);
  }
};

export const gitGoToHome = (req, res) => {
  res.redirect(routes.home);
};

export const naverGoToHome = (req, res) => {
  res.redirect(routes.home);
};

//로그아웃
export const logout = (req, res) => {
  req.logout();
  res.redirect(routes.home);
};

//가입
export const getJoin = (req, res) => res.render("join");

export const postJoin = async (req, res, next) => {
  const {
    body: { email, name, password, password1 },
  } = req;
  if (password !== password1) {
    res.status(400);
    res.redirect(routes.join);
  } else {
    try {
      const user = await User({
        email,
        name,
      });
      await User.register(user, password);
      next();
    } catch (error) {
      console.log(error);
      res.redirect(routes.home);
    }
  }
};

export const userDetail = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const user = await User.findById(id);
    console.log(user);
    res.render("userDetail", { pageTitle: "User Detail", user });
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const getEditProfile = (req, res) =>
  res.render("editProfile", { pageTitle: "Edit Profile" });

export const postEditProfile = async (req, res) => {
  const {
    body: { name, email },
    file,
  } = req;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      name,
      email,
      avatarUrl: file ? file.path : req.user.avatarUrl,
    });
    res.redirect(routes.me);
  } catch (error) {
    res.render("editProfile", { pageTitle: "Edit Profile" });
  }
};

export const getMe = (req, res) => {
  res.render("userDetail", { pageTitle: "User Detail", user: req.user });
};

//password
export const getChangePassword = (req, res) =>
  res.render("changePassword", { user: req.user });

export const postChangePassword = async (req, res) => {
  const {
    body: { password, newPassword, newPassword1 },
  } = req;
  try {
    if (newPassword !== newPassword1) {
      res.redirect(`${routes.user}/changePassword`);
      return;
    } else {
      await req.user.changePassword(password, newPassword);
      //getme안간다 여기 고치자
      res.redirect(routes.me);
    }
  } catch (error) {
    console.log(error);
    res.redirect(`${routes.user}/changePassword`);
  }
};
