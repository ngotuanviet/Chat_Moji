import mongoose from "mongoose";
const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
friendSchema.pre("save", function (next) {
  if (!this.userA || !this.userB) {
    return next();
  }

  const a = this.userA.toString();
  const b = this.userB.toString();
  if (a > b) {
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }
  next();
});
friendSchema.index({ userA: 1, userB: 1 }, { unique: true });
const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
