import { SignInOutput, SignUpOutput, AuthUser } from "aws-amplify/auth";

export type TSignUpState = SignUpOutput["nextStep"];
export type TSignInState = SignInOutput["nextStep"];
export type TAuthUser = AuthUser;

export type TRegisterFormProps = {
  email: string;
  password: string;
  password2: string;
};

export type TLoginFormProps = {
  email: string;
  password: string;
};

export type TConfirmationFormProps = {
  email: string;
  confirmationCode: string;
};
