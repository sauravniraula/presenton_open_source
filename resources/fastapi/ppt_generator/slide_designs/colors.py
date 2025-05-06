class Colors:

    white = "FFFFFF"
    black = "000000"

    background = "FFFFFF"

    heading = "181D27"
    sub_heading = "252B37"
    paragraph = "595F6C"
    connector = "AAAAAA"

    primary = "4580FF"
    primary_400 = "9FBDFF"

    color_1 = "6595FE"
    color_2 = "FF62A8"
    color_3 = "4AEC54"
    color_4 = "9C62FF"
    color_5 = "F1C335"
    color_6 = "FF7173"

    theme_color_mapping = {
        "accent1": color_1,
        "accent2": color_2,
        "accent3": color_3,
        "accent4": color_4,
        "accent5": color_5,
        "accent6": color_6,
    }


class DarkThemeColors(Colors):

    background = "1E1E1E"

    heading = "FFFFFF"
    sub_heading = "FFFFFF"
    paragraph = "DFDFDF"


class ClassicLightThemeColors(Colors):

    background = "EBEDF2"

    primary = "6485C5"
