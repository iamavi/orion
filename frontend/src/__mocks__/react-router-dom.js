const actualReactRouterDom = jest.requireActual("react-router-dom");

module.exports = {
  ...actualReactRouterDom,
  useNavigate: jest.fn(),
};
