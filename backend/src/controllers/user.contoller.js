import User from "../models/user.model.js";

export async function getRecommendedUsers(req, res) {
  try {
    // Exclude current user and their friends from recommendations
    const currentUserId = req.user.id;
    const currentUser = req.user;
//     console.log("Current User:", currentUser);
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { $id: { $nin: currentUser.friends } }, // Exclude current user's friends
        { isOnboarded: true }, // Only include onboarded users
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    // Populate friends field with user details
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
