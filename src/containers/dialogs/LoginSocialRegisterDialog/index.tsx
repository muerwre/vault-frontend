import React, { FC } from 'react';
import { connect } from 'react-redux';
import { IDialogProps } from '~/redux/modal/constants';
import { BetterScrollDialog } from '~/containers/dialogs/BetterScrollDialog';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginSocialRegisterDialogUnconnected: FC<Props> = ({ onRequestClose }) => (
  <BetterScrollDialog onClose={onRequestClose}>NEEDS REGISTER!</BetterScrollDialog>
);

const LoginSocialRegisterDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginSocialRegisterDialogUnconnected);

export { LoginSocialRegisterDialog };
