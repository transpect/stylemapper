<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tr = "http://transpect.io"
    xmlns:css="http://www.w3.org/1996/css"
    xmlns:dbk="http://docbook.org/ns/docbook"
    xpath-default-namespace="http://docbook.org/ns/docbook"
    exclude-result-prefixes="xs"
    version="2.0">
    
    <xsl:template match="*|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"></xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:function name="tr:hex2dec">
        <xsl:param name="hex"/>
        <xsl:variable name="dec"
            select="string-length(substring-before('0123456789ABCDEF', substring($hex,1,1)))"/>
        <xsl:choose>
            <xsl:when test="matches($hex, '([0-9]*|[A-F]*)')">
                <xsl:value-of
                    select="if ($hex = '') then 0
                    else $dec * tr:power(16, string-length($hex) - 1) + tr:hex2dec(substring($hex,2))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:message>Provided value is not hexadecimal...</xsl:message>
                <xsl:value-of select="$hex"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
  
  <xsl:function name="tr:cmyk2rgb">
    <xsl:param name="in"></xsl:param> 
    <xsl:variable name="cmyk" as="xs:string+">
      <xsl:sequence select="tokenize(replace($in, '^device-cmyk\(|\)|\s', ''), ',')"></xsl:sequence>
    </xsl:variable>
    <xsl:variable name="r">
      <xsl:value-of select="(1 - number($cmyk[1])) * (1 - number($cmyk[4]))  * 255"></xsl:value-of>
    </xsl:variable>
    <xsl:variable name="g">
      <xsl:value-of select="(1 - number($cmyk[2])) * (1 - number($cmyk[4]))  * 255"></xsl:value-of>
    </xsl:variable>
    <xsl:variable name="b">
      <xsl:value-of select="(1- number($cmyk[3])) * (1 - number($cmyk[4]))  * 255" ></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="$r, $g, $b"></xsl:sequence>
  </xsl:function>
  
    <xsl:function name="tr:power">
        <xsl:param name="base"/>
        <xsl:param name="exp"/>
        <xsl:sequence
            select="if ($exp lt 0) then tr:power(1.0 div $base, -$exp)
            else if ($exp eq 0)
            then 1e0
            else $base * tr:power($base, $exp - 1)"
        />
    </xsl:function>
    
    <xsl:function name="tr:hex2rgb">
        <xsl:param name="in"></xsl:param> 
        <xsl:variable name="r">
                    <xsl:variable name="r_v" select="tr:hex2dec(substring($in, 2, 2))"></xsl:variable>
                    <xsl:value-of select="$r_v"></xsl:value-of>
        </xsl:variable>
        <xsl:variable name="g">
                    <xsl:variable name="g_v" select="tr:hex2dec(substring($in, 4, 2))"></xsl:variable>
                    <xsl:value-of select="$g_v"></xsl:value-of>
        </xsl:variable>
        <xsl:variable name="b">
                    <xsl:variable name="b_v" select="tr:hex2dec(substring($in, 6, 2))"></xsl:variable>
                    <xsl:value-of select="$b_v" ></xsl:value-of>
        </xsl:variable>
        <xsl:value-of select="concat('rgb(',$r,',', $g,',', $b,')')"></xsl:value-of>
    </xsl:function>
    
    <xsl:function name="tr:color2hsl" as="xs:string+">
        <xsl:param name="in" as="xs:string?"></xsl:param>
       <xsl:message select="'RGBV____INPUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUT', $in"></xsl:message>
        <xsl:variable name="rgb"  as="xs:string+">
           <xsl:choose>
               <xsl:when test="starts-with($in,'rgb')">
                   <xsl:variable name="rgb_v"  as="xs:string+" select="tokenize(
                       replace($in, '^rgb\(|\)|\s', ''), ','
                       )"/>
                   <xsl:sequence select="$rgb_v"></xsl:sequence>        
               </xsl:when>
               <xsl:when test="starts-with($in,'#')">
                   <xsl:variable name="rgb_v"  as="xs:string+" select="tokenize(replace(tr:hex2rgb($in), '^rgb\(|\)|\s', ''), ',')"></xsl:variable>
                   <xsl:sequence select="$rgb_v"></xsl:sequence>        
<!--                   <xsl:message select="'RGBV______VALUE', tr:hex2rgb($in)"></xsl:message>-->
               </xsl:when>
               <xsl:when test="starts-with($in,'device-cmyk')">
                 <xsl:variable name="rgb_v" select="tr:cmyk2rgb($in)" as="xs:string+"></xsl:variable>
                <xsl:sequence select="$rgb_v"></xsl:sequence>        
<!--                <xsl:message select="'RGBV______VALUECMYK', $rgb_v"></xsl:message>-->
               </xsl:when>
               <xsl:when test="$in[not(. = '^#')] or $in[not(. = '^rgb')]">
                  <xsl:call-template name="names2rgb">
                    <xsl:with-param name="name" select="$in"/>
                  </xsl:call-template>
                   <!--                   <xsl:message select="'RGBV______VALUE_____black', $rgb_v"></xsl:message>-->
               </xsl:when>
               <xsl:otherwise>
                <xsl:message select="'Unknown color.'"></xsl:message>
              </xsl:otherwise>
           </xsl:choose>
       </xsl:variable>
        <xsl:message select="'RGBVALUE', $rgb"></xsl:message>
        <xsl:message select="'hahahahahah', string-join(for $v in $rgb return string(number($v)), ' ')"></xsl:message>
       <xsl:variable name="rgb_num" select="for $v in $rgb return number($v) div 255"></xsl:variable>
       
       <xsl:variable name="r" select="$rgb_num[1]"/>
       <xsl:variable name="g" select="$rgb_num[2]"/>
       <xsl:variable name="b" select="$rgb_num[3]"/>
       
        <xsl:variable name="min" select="min(($r, $g, $b))"/>
        <xsl:variable name="max" select="max(($r, $g, $b))"/>
       
       <xsl:variable name="d" select="$max - $min"/>
       <xsl:variable name="l" select="($max + $min) div 2"/>
       
        <xsl:message select="'MIN MAX', $min,'  ',  $max"></xsl:message>
        <xsl:message select="'D AND L', $d, '  ',  $l"></xsl:message>
        
        <xsl:variable name="h">
           <xsl:choose>
               <xsl:when test="$max eq $min">
                   <xsl:value-of select="0"></xsl:value-of>
               </xsl:when>
               <xsl:when test="$r eq $max">
                   <xsl:choose>
                       <xsl:when test="$g &lt; $b">
                             <xsl:variable name="h_v" select="(($g - $b) div $d) + 6"></xsl:variable>
                             <xsl:value-of select="$h_v"></xsl:value-of>
                       </xsl:when>
                       <xsl:otherwise>
                           <xsl:variable name="h_v" select="(($g - $b) div $d) + 0"></xsl:variable>
<!--                           <xsl:message select="' R = MAX', $h_v"></xsl:message>-->
                           <xsl:value-of select="$h_v"></xsl:value-of>
                       </xsl:otherwise>
                   </xsl:choose>
               </xsl:when>
               <xsl:when test="$g eq $max">
                   <xsl:variable name="h_v" select="(($b - $r) div $d) + 2"></xsl:variable>
<!--                   <xsl:message select="' G = MAX', $h_v"></xsl:message>-->
                   <xsl:value-of select="$h_v"></xsl:value-of>
               </xsl:when>
               <xsl:when test="$b eq $max">
                   <xsl:variable name="h_v" select="(($r - $g) div $d) + 4"></xsl:variable>
<!--                   <xsl:message select="' b = MAX', $h_v"></xsl:message>-->
                   <xsl:value-of select="$h_v"></xsl:value-of>
               </xsl:when>
           </xsl:choose>    
       </xsl:variable>
       <xsl:variable name="s">
           <xsl:choose>
               <xsl:when test="$max eq $min">
                   <xsl:value-of select="0"></xsl:value-of>
               </xsl:when>
               <xsl:otherwise>
                   <xsl:choose>
                       <xsl:when test="$l &gt; 0.5">
                           <xsl:variable name="s_v" select="$d div (2 - $max -$min)"></xsl:variable>
                           <xsl:value-of select="$s_v"></xsl:value-of>
                       </xsl:when>
                       <xsl:otherwise>
                           <xsl:variable name="s_v" select="$d div ($max + $min)"></xsl:variable>
                           <xsl:value-of select="$s_v"></xsl:value-of>
                       </xsl:otherwise>
                   </xsl:choose>
               </xsl:otherwise>
           </xsl:choose>
       </xsl:variable>
<!--        <xsl:message select="'LLLLLLLLLLLLLLL', $h,'  ', $s,'  ', $l, '  ', $d"></xsl:message>-->
        <xsl:sequence select="(xs:string(round($h div 6 * 360)), xs:string(round($s * 100)), xs:string(round($l * 100)))"></xsl:sequence>
    </xsl:function>
  
    <xsl:template name="names2rgb">
      <xsl:param name="name"></xsl:param>
      <xsl:choose>
        <xsl:when test="$name = 'black'">
          <xsl:sequence select="('0','0','0')"></xsl:sequence>
        </xsl:when>
        <xsl:when test="$name = 'red'">
          <xsl:sequence select="('255','0','0')"></xsl:sequence>
        </xsl:when>
        <xsl:when test="$name = 'green'">
          <xsl:sequence select="('0','255','0')"></xsl:sequence>
        </xsl:when>
        <xsl:when test="$name = 'blue'">
          <xsl:sequence select="('0','0','255')"></xsl:sequence>
        </xsl:when>
        <xsl:when test="$name = 'yellow'">
          <xsl:sequence select="('200','100','0')"></xsl:sequence>
        </xsl:when>
      </xsl:choose>
    </xsl:template>
    
    <xsl:template match="phrase|para" priority="2">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="./@css:color">
                    <xsl:attribute name="color-h" select="tr:color2hsl(@css:color)[1]"></xsl:attribute>
                    <xsl:attribute name="color-s" select="tr:color2hsl(@css:color)[2]"></xsl:attribute>
                    <xsl:attribute name="color-l" select="tr:color2hsl(@css:color)[3]"></xsl:attribute>                
            </xsl:when>
                <xsl:when test="./@css:background-color">
                    <xsl:attribute name="background-color-h" select="tr:color2hsl(@css:background-color)[1]"></xsl:attribute>
                    <xsl:attribute name="background-color-s" select="tr:color2hsl(@css:background-color)[2]"></xsl:attribute>
                    <xsl:attribute name="background-color-l" select="tr:color2hsl(@css:background-color)[3]"></xsl:attribute>                
                </xsl:when>
        </xsl:choose>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
    
</xsl:stylesheet>