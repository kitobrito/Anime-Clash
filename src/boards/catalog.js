import {sunnyVariant} from './sunny-rig.js';
// Every orientation has its own traced paths, bounds, anchors and placement areas.
// Coordinates are in a normalized 1000 x 1000 artwork space. They are never
// stretched from the other orientation. Fill holes use the even-odd rule.
const shape=(d,stroke=0)=>({d,stroke});
const prop=(id,label,kind,pieces,anchor)=>({id,label,kind,pieces:typeof pieces==='string'?[shape(pieces)]:pieces,anchor});
const forestPortrait=[
 prop('serpent','Forest serpent','serpent','M 0 216 C 4 204 20 193 43 186 C 18 149 47 108 97 91 C 134 78 170 87 198 100 L 245 111 L 264 137 L 274 148 L 263 155 L 251 151 L 236 146 C 220 138 215 125 185 120 C 146 111 131 129 137 154 C 146 174 164 188 180 205 C 217 250 193 279 148 291 C 97 309 45 305 0 278 Z M 70 232 C 95 240 118 242 128 229 C 137 213 119 189 105 174 C 95 163 86 149 91 137 C 56 165 62 185 73 199 C 87 216 86 225 70 232 Z',[263,143]),
 prop('scoreboard','Chūnin examination scoreboard','scoreboard','M 759 162 L 951 171 L 958 252 L 758 232 Z',[850,204]),
 prop('scroll','Forbidden scroll','scroll','M 52 858 L 112 797 Q 132 787 152 805 L 277 825 Q 301 828 318 843 L 274 906 Q 268 916 252 912 L 83 879 Q 55 881 52 858 Z',[179,850]),
 prop('nest','Spider nest and individual silk strands','spider',[
  shape('M 841 860 C 859 850 894 866 895 887 C 902 913 871 925 849 904 C 835 893 832 873 841 860 Z M 824 845 Q 839 836 849 851 Q 853 868 834 870 Q 816 860 824 845 Z M 702 946 Q 723 934 736 952 Q 740 973 718 977 Q 697 972 702 946 Z M 925 809 Q 938 799 950 814 Q 955 829 940 834 Q 925 829 925 809 Z'),
  shape('M 840 863 L 817 842 L 786 847 M 842 872 L 799 863 L 779 882 M 845 880 L 805 898 L 790 924 M 852 891 L 830 925 L 826 949 M 865 865 L 898 840 L 928 843 M 876 875 L 921 866 L 940 885 M 881 886 L 923 906 L 937 939 M 878 897 L 898 934 L 896 961 M 715 948 L 685 931 L 667 941 M 709 957 L 679 959 L 665 974 M 721 964 L 730 992 M 728 950 L 753 931 L 765 943 M 733 959 L 760 967 L 769 984 M 932 816 L 906 804 L 896 814 M 941 811 L 956 787 M 946 820 L 976 809 M 941 828 L 958 846',5.5),
  shape('M 785 781 L 965 999 M 659 854 L 997 842 M 581 997 L 997 778 M 714 999 L 995 909 M 895 998 L 920 776 M 758 999 L 752 820 M 618 969 Q 836 964 982 805 M 659 993 Q 852 983 995 837 M 633 925 Q 811 945 963 803 M 678 872 Q 810 900 951 792 M 710 835 Q 831 865 934 784 M 798 999 Q 883 909 991 890',1.8)
 ],[859,877])
];
const forestLandscape=[
 prop('serpent','Forest serpent','serpent','M 0 226 C 32 223 42 227 59 234 C 32 199 21 154 66 124 C 109 87 146 103 173 129 L 194 149 L 199 165 L 183 177 L 167 169 L 143 148 C 116 130 83 143 96 177 C 107 204 127 220 137 245 C 164 308 130 366 72 392 C 51 402 20 401 0 389 L 0 335 C 39 342 84 330 85 305 C 45 320 19 306 0 290 Z M 45 272 C 61 283 76 282 80 273 C 83 262 71 249 62 239 Z',[193,168]),
 prop('scoreboard','Chūnin examination scoreboard','scoreboard','M 823 129 L 944 137 L 948 348 L 821 329 Z',[882,230]),
 prop('scroll','Forbidden scroll','scroll','M 53 806 L 85 731 Q 93 718 105 735 L 185 786 Q 201 791 192 818 L 176 858 Q 168 873 158 861 L 69 831 Q 48 829 53 806 Z',[119,797]),
 prop('nest','Spider nest and individual silk strands','spider',[
  shape('M 849 918 Q 853 890 871 887 Q 892 894 892 919 Q 878 942 858 935 Z M 862 882 Q 875 863 887 884 Q 886 900 870 901 Z M 923 758 Q 932 741 942 758 Q 945 775 931 780 Z'),
  shape('M 864 893 L 842 870 L 820 877 M 858 904 L 822 902 L 809 923 M 858 917 L 834 941 L 830 967 M 872 930 L 869 979 M 879 895 L 901 865 L 920 871 M 887 904 L 918 901 L 935 922 M 889 916 L 920 939 L 924 965 M 880 928 L 899 973 M 930 756 L 908 741 L 895 748 M 939 754 L 956 728 M 940 769 L 961 774 M 931 778 L 916 802',4),
  shape('M 805 996 L 990 597 M 999 660 L 786 908 M 998 770 L 839 992 M 996 929 L 826 764 M 999 860 L 852 849 M 902 999 L 917 690 M 853 956 Q 933 903 995 707 M 837 920 Q 924 870 986 655 M 874 988 Q 964 908 998 753 M 830 866 Q 904 813 966 650',1.8)
 ],[872,912])
];
export const BOARD_THEMES={
 forest:{faction:'Naruto',name:'Forest of Death',accent:'#a8df78',portrait:{source:'IMG_5311.JPG',size:[768,1376],props:forestPortrait,platform:'M 250 313 L 748 313 L 902 782 L 94 782 Z',play:[.255,.35,.49,.39]},landscape:{source:'IMG_5310.JPG',size:[1376,768],props:forestLandscape,platform:'M 290 434 L 701 435 L 835 844 L 168 837 Z',play:[.285,.47,.43,.29]}},
 village:{faction:'Naruto',name:'Village Overlook',accent:'#efbf78',portrait:{source:'IMG_5290.JPG',size:[768,1376],platform:'M 177 316 L 806 316 L 993 777 L 0 777 Z',play:[.23,.37,.55,.30],props:[
 prop('training','Training dummy','training','M 8 113 L 90 94 L 89 42 Q 127 24 176 41 L 185 98 L 231 96 Q 267 105 257 134 L 186 153 L 188 321 L 71 328 L 92 153 L 15 155 Z',[133,173]),
 prop('ramen','Ramen stand and lantern','ramen','M 775 43 L 999 76 L 999 329 L 799 324 L 721 279 L 725 230 L 780 200 L 777 146 L 751 145 L 753 99 L 768 95 Z',[870,214]),
 prop('seal','Sealing pedestal and candles','seal','M 0 825 L 107 780 L 327 819 L 511 908 L 483 999 L 0 999 Z',[217,862]),
 prop('cabinet','Scroll shrine','cabinet','M 645 692 L 774 665 L 848 687 L 944 700 L 999 697 L 999 999 L 633 999 L 661 898 L 665 788 L 638 768 Z',[825,847])]},landscape:{source:'IMG_5289.JPG',size:[1376,768],platform:'M 256 373 L 728 373 L 852 775 L 141 774 Z',play:[.255,.43,.49,.28],props:[
 prop('training','Training dummy','training','M 0 58 L 37 49 L 37 154 L 81 156 L 97 143 L 126 152 L 125 203 L 94 215 L 88 339 L 42 379 L 24 279 L 18 253 L 0 249 Z',[55,193]),
 prop('cabinet','Scroll shrine','cabinet','M 831 34 L 874 25 L 887 0 L 925 16 L 963 8 L 999 49 L 999 473 L 836 475 L 818 452 L 825 271 L 821 243 L 841 232 L 841 107 L 824 98 Z',[905,238]),
 prop('ramen','Ramen stand and lantern','ramen','M 0 576 L 26 576 L 58 552 L 84 564 L 125 618 L 171 675 L 176 697 L 157 697 L 151 724 L 182 791 L 186 999 L 0 999 Z',[85,795]),
 prop('seal','Sealing pedestal and candles','seal','M 695 934 L 749 800 L 774 761 L 788 769 L 798 732 L 826 751 L 831 703 L 846 735 L 851 718 L 862 741 L 871 684 L 886 739 L 935 781 L 950 747 L 960 793 L 999 810 L 999 999 L 699 999 Z',[866,849])]}},
 sunny:{faction:'One Piece',name:'Thousand Sunny',accent:'#73e5f4',portrait:sunnyVariant('portrait'),landscape:sunnyVariant('landscape')},
 sea:{faction:'One Piece',name:'Sea King Tempest',accent:'#5ed7e5',portrait:{source:'IMG_5313.JPG',size:[286,512],platform:'M 227 231 L 741 231 L 818 776 L 157 776 Z',play:[.24,.30,.49,.40],props:[
 prop('monster','Sea King eye','monster','M 0 82 L 30 91 L 60 105 L 87 126 L 100 151 L 178 154 L 222 179 L 250 206 L 207 231 L 167 231 L 139 250 L 97 259 L 32 243 L 0 230 Z',[113,184]),
 prop('harpoon','Harpoon cannon','harpoon','M 749 174 L 758 163 L 901 175 L 955 164 L 970 171 L 999 159 L 999 312 L 959 304 L 918 281 L 885 269 L 873 243 L 815 239 L 803 220 L 766 210 Z',[890,219]),
 prop('navigator','Telephone snail and map','navigator','M 17 812 L 58 802 L 62 799 L 75 781 L 91 788 L 98 802 L 143 802 L 180 816 L 197 850 L 229 862 L 283 884 L 310 926 L 256 965 L 215 999 L 35 997 L 20 943 L 6 914 Z',[141,892]),
 prop('treasure','Treasure and barrels','treasure','M 817 856 L 841 843 L 862 854 L 864 901 L 898 909 L 909 885 L 932 884 L 934 901 L 950 906 L 966 878 L 988 877 L 999 917 L 999 999 L 739 999 L 708 964 L 737 936 L 745 919 L 780 918 L 792 907 Z',[857,943])]},landscape:{source:'IMG_5312.JPG',size:[1376,768],platform:'M 252 227 L 730 227 L 838 694 L 119 689 Z',play:[.26,.30,.46,.31],props:[
 prop('monster','Sea King eye','monster','M 0 0 L 113 0 Q 172 31 203 95 L 230 143 L 213 171 L 180 174 L 146 190 L 101 224 L 70 230 L 33 208 L 0 203 Z',[112,137]),
 prop('harpoon','Harpoon cannon','harpoon','M 750 118 L 778 113 L 818 140 L 851 137 L 857 104 L 867 103 L 869 142 L 879 146 L 894 111 L 909 110 L 902 172 L 938 184 L 940 243 L 893 261 L 872 267 L 844 264 L 827 249 L 782 251 L 766 236 L 773 205 L 784 185 L 765 160 Z',[849,191]),
 prop('navigator','Telephone snail and map','navigator','M 65 780 L 99 746 L 119 759 L 132 790 L 164 806 L 156 753 L 173 744 L 182 780 L 185 829 L 209 835 L 229 895 L 230 960 L 209 999 L 7 999 L 27 929 L 64 868 Z',[132,878]),
 prop('treasure','Treasure and barrels','treasure','M 856 710 L 873 712 L 889 732 L 893 762 L 931 770 L 959 789 L 991 759 L 999 773 L 999 999 L 764 999 L 756 952 L 786 897 L 813 886 L 819 824 L 841 798 L 839 744 Z',[890,884])]}}
};
export const BOARD_KEYS=Object.keys(BOARD_THEMES);
export function boardVariant(theme,orientation){const def=BOARD_THEMES[theme];if(!def||!def[orientation])throw new Error('Unknown board or orientation');return {...def[orientation],theme,orientation,name:def.name,faction:def.faction,accent:def.accent,key:`${theme}-${orientation}`};}
export function boardOptions(faction){return BOARD_KEYS.filter(k=>BOARD_THEMES[k].faction===faction);}
