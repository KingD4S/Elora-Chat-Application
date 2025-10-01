import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

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

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recepientId } = req.params;

    //prevent sending request to yourself
    if (myId === recepientId) {
      return res
        .status(400)
        .json({ message: "You can't sent friend request to yourself" });
    }

    const recipient = await User.findById(recepientId);
    if (!recipient)
      return res.status(404).json({ message: "Recipient not Found" });

    //check if already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    //check if req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recepientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest)
      return res.status(404).json({ message: "Friend Request not found" });
    //check if the logged in user is the recipient of the friend request
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to accept this friend request",
        });
    }

    friendRequest.status = "accepted";

    //add each other as friends
    //$andToSet adds to array only if the value is not already present in the array
    await User.findById(friendRequest.sender, {
      $andToSet: { friends: friendRequest.recipient },
    });
    await User.findById(friendRequest.recipient, {
      $andToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend Request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", 'fullName profilePic nativeLanguage learningLanguage' );

    const acceptedRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", 'fullName profilePic' );

    res.status(200).json({ incomingRequests, acceptedRequests });
  }
  catch (error) {
    console.error("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendRequests(req, res) {
   try {
     const outgoingRequests = await FriendRequest.find({
        sender: req.user.id,
        status: "pending",
     }).populate("recipient", 'fullName profilePic nativeLanguage learningLanguage' );

      res.status(200).json(outgoingRequests);
   } catch (error) {
      console.error("Error in getOutgoingFriendRequests controller", error.message);  
      res.status(500).json({ message: "Internal Server Error" });
   }
}